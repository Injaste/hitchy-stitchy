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
  subscribeToTimeline,
} from "./api"
import { groupTimeline } from "./utils"
import type {
  CreateTimelineItemPayload,
  DeleteTimelineItemPayload,
  UpdateTimelineItemPayload,
  StartTimelinePayload,
  EndTimelinePayload,
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

        const flat = old.days.flatMap((d) => d.labelGroups.flatMap((g) => g.items))

        if (payload.eventType === "DELETE") {
          const id = (payload.old as Partial<Timeline>).id
          return id ? groupTimeline(flat.filter((i) => i.id !== id)) : old
        }

        const row = payload.new as unknown as Timeline
        const next = flat.some((i) => i.id === row.id)
          ? flat.map((i) => (i.id === row.id ? row : i))
          : [...flat, row]
        return groupTimeline(next)
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
      const flat = old.days.flatMap((d) => d.labelGroups.flatMap((g) => g.items))
      return groupTimeline(fn(flat))
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

export function useTimelineLifecycleMutations() {
  const { slug } = useAdminStore()
  const queryClient = useQueryClient()

  const applyResult = (result: Timeline) => {
    queryClient.setQueryData<TimelineGrouped>(adminKeys.timeline(slug!), (old) => {
      if (!old) return old
      const flat = old.days.flatMap((d) => d.labelGroups.flatMap((g) => g.items))
      return groupTimeline(flat.map((item) => (item.id === result.id ? result : item)))
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
