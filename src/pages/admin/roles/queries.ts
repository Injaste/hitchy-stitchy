import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { isAdminMember } from "@/pages/admin/bootstrap/utils"
import { fetchRoles, createRole, updateRole, deleteRole } from "./api"
import type { CreateRolePayload, UpdateRolePayload, DeleteRolePayload, Role } from "./types"
import type { Member } from "../members/types"
import type { AdminBootstrapContext } from "../types"

export function useRolesQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.roles(slug!),
    queryFn: () => fetchRoles(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useRoleMutations() {
  const { slug, memberRoleId } = useAdminStore()
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
      onSuccess: (result: Role) => {
        setRoles((old) => old?.map((r) => r.id === result.id ? result : r) ?? [])
        setMembers((old) =>
          old?.map((m) => m.role_id === result.id ? { ...m, role: result } : m) ?? []
        )

        if (result.id === memberRoleId) {
          queryClient.setQueryData<AdminBootstrapContext>(
            adminKeys.bootstrap(slug!),
            (old) => old && {
              ...old,
              memberRoleName: result.name,
              memberRoleShortName: result.short_name,
              memberRoleCategory: result.category,
              isAdmin: isAdminMember(result.category),
            },
          )
        }
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
      },
    },
  )

  return { create, update, remove }
}
