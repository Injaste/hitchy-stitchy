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
    enabled: !!eventId,
  })
}

export function useActiveTimelineQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.activeTimeline(slug!),
    queryFn: () => fetchActiveTimeline(eventId!),
    enabled: !!eventId,
  })
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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.timeline(slug!) })
    queryClient.invalidateQueries({ queryKey: adminKeys.activeTimeline(slug!) })
  }

  const start = useMutation(
    (payload: StartTimelinePayload) => startTimelineItem(payload),
    {
      successMessage: (result: Timeline) => `"${truncate(result.title)}" is live`,
      errorMessage: (err) => err.message,
      onSuccess: invalidate,
    },
  )

  const end = useMutation(
    (payload: EndTimelinePayload) => endTimelineItem(payload),
    {
      successMessage: (result: Timeline) => `"${truncate(result.title)}" ended`,
      errorMessage: (err) => err.message,
      onSuccess: invalidate,
    },
  )

  return { start, end }
}
