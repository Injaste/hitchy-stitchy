import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { useTimelineModalStore } from "./hooks/useTimelineModalStore"
import {
  fetchTimeline,
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
} from "./api"
import { groupTimeline } from "./utils"
import type {
  CreateTimelineItemPayload,
  DeleteTimelineItemPayload,
  UpdateTimelineItemPayload,
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

export function useTimelineMutations() {
  const { slug } = useAdminStore()
  const closeAll = useTimelineModalStore((s) => s.closeAll)
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
      successMessage: "Item added",
      errorMessage: (err) => err.message,
      onSuccess: (result: Timeline) => {
        setTimeline((items) => [...items, result])
        closeAll()
      },
    }
  )

  const update = useMutation(
    (payload: UpdateTimelineItemPayload) => updateTimelineItem(payload),
    {
      successMessage: "Item updated",
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: UpdateTimelineItemPayload) => {
        setTimeline((items) =>
          items.map((item) => item.id === args.id ? { ...item, ...args } : item)
        )
        closeAll()
      },
    }
  )

  const remove = useMutation(
    (payload: DeleteTimelineItemPayload) => deleteTimelineItem(payload),
    {
      successMessage: "Item deleted",
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: DeleteTimelineItemPayload) => {
        setTimeline((items) => items.filter((item) => item.id !== args.id))
        closeAll()
      },
    }
  )

  return { create, update, remove }
}
