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
import type { CreateTimelineItemPayload, DeleteTimelineItemPayload, UpdateTimelineItemPayload } from "./types"

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
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: adminKeys.timeline(slug!) })

  const create = useMutation(
    (payload: CreateTimelineItemPayload) => createTimelineItem(payload),
    {
      successMessage: "Item added",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    }
  )

  const update = useMutation(
    (payload: UpdateTimelineItemPayload) => updateTimelineItem(payload),
    {
      successMessage: "Item updated",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    }
  )

  const remove = useMutation(
    (payload: DeleteTimelineItemPayload) => deleteTimelineItem(payload),
    {
      successMessage: "Item deleted",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    }
  )

  return { create, update, remove }
}
