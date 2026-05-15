import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { useRoleModalStore } from "./hooks/useRoleModalStore"
import { fetchRoles, createRole, updateRole, deleteRole } from "./api"
import type { CreateRolePayload, UpdateRolePayload, DeleteRolePayload, Role } from "./types"
import type { Member } from "../members/types"

export function useRolesQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.roles(slug!),
    queryFn: () => fetchRoles(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useRoleMutations() {
  const { slug } = useAdminStore()
  const closeAll = useRoleModalStore((s) => s.closeAll)
  const queryClient = useQueryClient()

  const setRoles = (fn: (old: Role[] | undefined) => Role[]) =>
    queryClient.setQueryData<Role[]>(adminKeys.roles(slug!), fn)

  const setMembers = (fn: (old: Member[] | undefined) => Member[]) =>
    queryClient.setQueryData<Member[]>(adminKeys.members(slug!), fn)

  const create = useMutation(
    (payload: CreateRolePayload) => createRole(payload),
    {
      successMessage: "Role created",
      errorMessage: (err) => err.message,
      onSuccess: (result: Role) => {
        setRoles((old) => [...(old ?? []), result])
      },
    },
  )

  const update = useMutation(
    (payload: UpdateRolePayload) => updateRole(payload),
    {
      successMessage: "Role updated",
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: UpdateRolePayload) => {
        setRoles((old) => old?.map((r) => r.id === args.id ? { ...r, ...args } : r) ?? [])
        setMembers((old) =>
          old?.map((m) => m.role_id === args.id ? { ...m, role: { ...m.role, ...args } } : m) ?? []
        )
      },
    },
  )

  const remove = useMutation(
    (payload: DeleteRolePayload) => deleteRole(payload),
    {
      successMessage: "Role deleted",
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: DeleteRolePayload) => {
        setRoles((old) => old?.filter((r) => r.id !== args.id) ?? [])
        queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) })
        closeAll()
      },
    },
  )

  return { create, update, remove }
}
