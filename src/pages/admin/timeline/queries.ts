import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { useTimelineModalStore } from "./hooks/useTimelineStore"
import {
  fetchTimeline,
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
} from "./api"
import type { CreateTimelineItemPayload, UpdateTimelineItemPayload } from "./types"

function timelineQueryKey(slug: string) {
  return [`${slug}:timeline`] as const
}

export function useTimeline() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: timelineQueryKey(slug!),
    queryFn: () => fetchTimeline(eventId!),
    enabled: !!eventId,
  })
}

export function useTimelineMutations() {
  const { slug } = useAdminStore()
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: timelineQueryKey(slug!) })

  const create = useMutation(
    (payload: CreateTimelineItemPayload) => createTimelineItem(payload),
    {
      successMessage: "Item added",
      errorMessage: "Failed to add item",
      onSuccess: () => { invalidate(); closeAll() },
    }
  )

  const update = useMutation(
    (payload: UpdateTimelineItemPayload) => updateTimelineItem(payload),
    {
      successMessage: "Item updated",
      errorMessage: "Failed to update item",
      onSuccess: () => { invalidate(); closeAll() },
    }
  )

  const remove = useMutation(
    (id: string) => deleteTimelineItem(id),
    {
      successMessage: "Item deleted",
      errorMessage: "Failed to delete item",
      onSuccess: () => { invalidate(); closeAll() },
    }
  )

  return { create, update, remove }
}
