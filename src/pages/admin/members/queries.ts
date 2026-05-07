import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { useMemberModalStore } from "./hooks/useMemberModalStore"
import {
  fetchMembers,
  inviteMember,
  updateMember,
  updateMyDisplayName,
  freezeMember,
  deleteMember,
} from "./api"
import type {
  InviteMemberPayload,
  UpdateMemberPayload,
  UpdateMyDisplayNamePayload,
  FreezeMemberPayload,
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
  const { slug, eventId } = useAdminStore()
  const closeAll = useMemberModalStore((s) => s.closeAll)
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) })
    queryClient.invalidateQueries({ queryKey: adminKeys.tasks(slug!) })
  }

  const invite = useMutation(
    (payload: InviteMemberPayload) => inviteMember(payload),
    {
      successMessage: "Invite sent",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const update = useMutation(
    (payload: UpdateMemberPayload) => updateMember(payload),
    {
      successMessage: "Member updated",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const updateMyName = useMutation(
    (display_name: string) => updateMyDisplayName({ event_id: eventId!, display_name }),
    {
      successMessage: "Name updated",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const freeze = useMutation(
    (payload: FreezeMemberPayload) => freezeMember(payload),
    {
      successMessage: (_r, args) =>
        args.freeze ? "Access frozen" : "Access restored",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const remove = useMutation(
    (payload: DeleteMemberPayload) => deleteMember(payload),
    {
      successMessage: "Member removed",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  return { invite, update, updateMyName, freeze, remove }
}