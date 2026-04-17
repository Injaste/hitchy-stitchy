import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { fetchInvitation, updateInvitation } from "./api"
import type { UpdateInvitationPayload } from "./types"

export function useInvitationQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.invitation(slug!),
    queryFn: () => fetchInvitation(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useUpdateInvitationMutation() {
  const { slug } = useAdminStore()
  const queryClient = useQueryClient()

  return useMutation(
    (payload: UpdateInvitationPayload) => updateInvitation(payload),
    {
      toast: {
        loading: "Saving...",
        success: "Saved",
        error: "Failed to save",
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: adminKeys.invitation(slug!) })
      },
    },
  )
}
