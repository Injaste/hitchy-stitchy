import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { truncate } from "@/lib/utils"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import {
  fetchTimeline,
  fetchActiveTimeline,
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
  startTimelineItem,
  endTimelineItem,
  createSegment,
  updateSegment,
  deleteSegment,
  reorderSegments,
  subscribeToTimeline,
} from "./api"
import { groupTimeline, flattenTimeline } from "./utils"
import type {
  CreateTimelineItemPayload,
  DeleteTimelineItemPayload,
  UpdateTimelineItemPayload,
  StartTimelinePayload,
  EndTimelinePayload,
  CreateSegmentPayload,
  UpdateSegmentPayload,
  DeleteSegmentPayload,
  ReorderSegmentsPayload,
  EventSegment,
  Timeline,
  TimelineGrouped,
} from "./types"

export function useTimelineQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.timeline(slug!),
    queryFn: () => fetchTimeline(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useActiveTimelineQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.activeTimeline(slug!),
    queryFn: () => fetchActiveTimeline(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useTimelineRealtime() {
  const { slug, eventId } = useAdminStore()
  const qc = useQueryClient()

  useEffect(() => {
    if (!eventId || !slug) return

    const unsubscribe = subscribeToTimeline(eventId, (payload) => {
      qc.setQueryData<TimelineGrouped>(adminKeys.timeline(slug), (old) => {
        if (!old) return old

        const flat = flattenTimeline(old)

        if (payload.eventType === "DELETE") {
          const id = (payload.old as Partial<Timeline>).id
          return id
            ? groupTimeline(flat.filter((i) => i.id !== id), old.eventDays, old.eventSegments)
            : old
        }

        const row = payload.new as unknown as Timeline
        const next = flat.some((i) => i.id === row.id)
          ? flat.map((i) => (i.id === row.id ? row : i))
          : [...flat, row]
        return groupTimeline(next, old.eventDays, old.eventSegments)
      })

      qc.invalidateQueries({ queryKey: adminKeys.activeTimeline(slug) })
    })

    return unsubscribe
  }, [eventId, slug, qc])
}

export function useTimelineMutations() {
  const { slug } = useAdminStore()
  const queryClient = useQueryClient()

  const setTimeline = (fn: (items: Timeline[]) => Timeline[]) => {
    queryClient.setQueryData<TimelineGrouped>(adminKeys.timeline(slug!), (old) => {
      if (!old) return old
      return groupTimeline(fn(flattenTimeline(old)), old.eventDays, old.eventSegments)
    })
  }

  const create = useMutation(
    (payload: CreateTimelineItemPayload) => createTimelineItem(payload),
    {
      successMessage: (result: Timeline) => `"${truncate(result.title)}" added`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Timeline) => {
        setTimeline((items) => [...items, result])
      },
    }
  )

  const update = useMutation(
    (payload: UpdateTimelineItemPayload) => updateTimelineItem(payload),
    {
      successMessage: (result: Timeline) => `"${truncate(result.title)}" updated`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Timeline) => {
        setTimeline((items) =>
          items.map((item) => item.id === result.id ? result : item)
        )
      },
    }
  )

  const remove = useMutation(
    (payload: DeleteTimelineItemPayload) => deleteTimelineItem(payload),
    {
      successMessage: (_: void, args: DeleteTimelineItemPayload) =>
        `"${truncate(args.title)}" deleted`,
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: DeleteTimelineItemPayload) => {
        setTimeline((items) => items.filter((item) => item.id !== args.id))
      },
    }
  )

  return { create, update, remove }
}

export function useSegmentMutations() {
  const { slug } = useAdminStore()
  const queryClient = useQueryClient()

  const patchSegments = (fn: (segments: EventSegment[]) => EventSegment[]) => {
    queryClient.setQueryData<TimelineGrouped>(adminKeys.timeline(slug!), (old) => {
      if (!old) return old
      return groupTimeline(flattenTimeline(old), old.eventDays, fn(old.eventSegments))
    })
  }

  const create = useMutation(
    (payload: CreateSegmentPayload) => createSegment(payload),
    {
      successMessage: (result: EventSegment) => `"${truncate(result.name ?? "Segment")}" added`,
      errorMessage: (err) => err.message,
      onSuccess: (result: EventSegment) => {
        patchSegments((segments) => [...segments, result])
      },
    }
  )

  const update = useMutation(
    (payload: UpdateSegmentPayload) => updateSegment(payload),
    {
      successMessage: (result: EventSegment) => `Renamed to "${truncate(result.name ?? "")}"`,
      errorMessage: (err) => err.message,
      onSuccess: (result: EventSegment) => {
        patchSegments((segments) =>
          segments.map((s) => (s.id === result.id ? result : s)),
        )
      },
    }
  )

  const reorder = useMutation(
    (payload: ReorderSegmentsPayload) => reorderSegments(payload),
    {
      silent: true,
      // Optimistic: patch sort_order on mutate so the drop holds its new place
      // immediately (no jump-back), and revert from the snapshot if the server
      // rejects — the sortable transition then animates the rows back.
      onMutate: (args: ReorderSegmentsPayload) => {
        const prev = queryClient.getQueryData<TimelineGrouped>(
          adminKeys.timeline(slug!),
        )
        const order = new Map(args.ids.map((id, i) => [id, i]))
        patchSegments((segments) =>
          segments.map((s) =>
            order.has(s.id) ? { ...s, sort_order: order.get(s.id)! } : s,
          ),
        )
        return { prev }
      },
      onError: (_err, _args, context) => {
        if (context?.prev) {
          queryClient.setQueryData(adminKeys.timeline(slug!), context.prev)
        }
      },
    }
  )

  const remove = useMutation(
    (payload: DeleteSegmentPayload) => deleteSegment(payload),
    {
      successMessage: (_: void, args: DeleteSegmentPayload) =>
        `"${truncate(args.name ?? "Segment")}" deleted`,
      errorMessage: (err) => err.message,
      // Patch the cache (mirror delete_segment's reassignment) rather than
      // invalidate — a refetch can resolve late and clobber a concurrent patch.
      onSuccess: (_: void, args: DeleteSegmentPayload) => {
        queryClient.setQueryData<TimelineGrouped>(adminKeys.timeline(slug!), (old) => {
          if (!old) return old
          const seg = old.eventSegments.find((s) => s.id === args.id)
          if (!seg) return old
          // Inherit items: the previous segment by sort_order, else the next.
          const siblings = old.eventSegments
            .filter((s) => s.day_id === seg.day_id && s.id !== args.id)
            .sort((a, b) => a.sort_order - b.sort_order)
          const target =
            [...siblings].reverse().find((s) => s.sort_order < seg.sort_order)?.id ??
            siblings[0]?.id ??
            null
          const items = flattenTimeline(old).map((i) =>
            i.segment_id === args.id && target ? { ...i, segment_id: target } : i,
          )
          const segments = old.eventSegments.filter((s) => s.id !== args.id)
          return groupTimeline(items, old.eventDays, segments)
        })
      },
    }
  )

  return { create, update, remove, reorder }
}

export function useTimelineLifecycleMutations() {
  const { slug } = useAdminStore()
  const queryClient = useQueryClient()

  const applyResult = (result: Timeline) => {
    queryClient.setQueryData<TimelineGrouped>(adminKeys.timeline(slug!), (old) => {
      if (!old) return old
      return groupTimeline(
        flattenTimeline(old).map((item) => (item.id === result.id ? result : item)),
        old.eventDays,
        old.eventSegments,
      )
    })
    queryClient.invalidateQueries({ queryKey: adminKeys.timeline(slug!) })
    queryClient.invalidateQueries({ queryKey: adminKeys.activeTimeline(slug!) })
  }

  const start = useMutation(
    (payload: StartTimelinePayload) => startTimelineItem(payload),
    {
      successMessage: (result: Timeline) => `"${truncate(result.title)}" is live`,
      errorMessage: (err) => err.message,
      onSuccess: applyResult,
    },
  )

  const end = useMutation(
    (payload: EndTimelinePayload) => endTimelineItem(payload),
    {
      successMessage: (result: Timeline) => `"${truncate(result.title)}" ended`,
      errorMessage: (err) => err.message,
      onSuccess: applyResult,
    },
  )

  return { start, end }
}
