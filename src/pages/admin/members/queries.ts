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
  Member,
  InviteMemberPayload,
  UpdateMemberPayload,
  FreezeMemberPayload,
  DeleteMemberPayload,
} from "./types"
import type { Role } from "../roles/types"

export function useMembersQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.members(slug!),
    queryFn: () => fetchMembers(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useMemberMutations() {
  const { slug, eventId, memberId } = useAdminStore()
  const closeAll = useMemberModalStore((s) => s.closeAll)
  const queryClient = useQueryClient()

  const setMembers = (fn: (old: Member[] | undefined) => Member[]) =>
    queryClient.setQueryData<Member[]>(adminKeys.members(slug!), fn)

  const invite = useMutation(
    (payload: InviteMemberPayload) => inviteMember(payload),
    {
      successMessage: "Invite sent",
      errorMessage: (err) => err.message,
      onSuccess: (result: Member) => {
        const roles = queryClient.getQueryData<Role[]>(adminKeys.roles(slug!))
        const role = roles?.find((r) => r.id === result.role_id)
        if (!role) {
          queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) })
        } else {
          setMembers((old) => [...(old ?? []), { ...result, role }])
        }
        closeAll()
      },
    },
  )

  const update = useMutation(
    (payload: UpdateMemberPayload) => updateMember(payload),
    {
      successMessage: "Member updated",
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: UpdateMemberPayload) => {
        const roles = queryClient.getQueryData<Role[]>(adminKeys.roles(slug!))
        const newRole = roles?.find((r) => r.id === args.role_id)
        if (!newRole) {
          queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) })
        } else {
          setMembers((old) =>
            old?.map((m) =>
              m.id === args.id
                ? { ...m, display_name: args.display_name, role_id: args.role_id, role: newRole }
                : m
            ) ?? []
          )
        }
        closeAll()
      },
    },
  )

  const updateMyName = useMutation(
    (display_name: string) => updateMyDisplayName({ event_id: eventId!, display_name }),
    {
      successMessage: "Name updated",
      errorMessage: (err) => err.message,
      onSuccess: (_: void, display_name: string) => {
        setMembers((old) => old?.map((m) => m.id === memberId ? { ...m, display_name } : m) ?? [])
        closeAll()
      },
    },
  )

  const freeze = useMutation(
    (payload: FreezeMemberPayload) => freezeMember(payload),
    {
      successMessage: (_r, args) =>
        args.freeze ? "Access frozen" : "Access restored",
      errorMessage: (err) => err.message,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) })
        closeAll()
      },
    },
  )

  const remove = useMutation(
    (payload: DeleteMemberPayload) => deleteMember(payload),
    {
      successMessage: "Member removed",
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: DeleteMemberPayload) => {
        setMembers((old) => old?.filter((m) => m.id !== args.id) ?? [])
        closeAll()
      },
    },
  )

  return { invite, update, updateMyName, freeze, remove }
}
