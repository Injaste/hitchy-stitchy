import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { useMemberModalStore } from "./hooks/useMemberModalStore"
import {
  fetchMembers,
  inviteMember,
  updateMember,
  setMemberFrozen,
  deleteMember,
} from "./api"
import type {
  InviteMemberPayload,
  UpdateMemberPayload,
  SetMemberFrozenPayload,
  DeleteMemberPayload,
} from "./types"

export function useMembersQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.members(slug!),
    queryFn: () => fetchMembers(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useMemberMutations() {
  const { slug } = useAdminStore()
  const closeAll = useMemberModalStore((s) => s.closeAll)
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) })

  const invite = useMutation(
    (payload: InviteMemberPayload) => inviteMember(payload),
    {
      successMessage: "Invite sent",
      errorMessage: "Failed to send invite",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const update = useMutation(
    (payload: UpdateMemberPayload) => updateMember(payload),
    {
      successMessage: "Member updated",
      errorMessage: "Failed to update member",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const remove = useMutation(
    (payload: DeleteMemberPayload) => deleteMember(payload),
    {
      successMessage: "Member delete",
      errorMessage: "Failed to delete member",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const freeze = useMutation(
    (payload: SetMemberFrozenPayload) => setMemberFrozen(payload),
    {
      successMessage: (_r, args) =>
        args.is_frozen ? "Access frozen" : "Access restored",
      errorMessage: "Failed to update access",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  return { invite, update, remove, freeze }
}
