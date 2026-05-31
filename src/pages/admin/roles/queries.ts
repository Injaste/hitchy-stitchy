import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { truncate } from "@/lib/utils"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { fetchRoles, createRole, updateRole, deleteRole, fetchAvailableResources } from "./api"
import type { Role, CreateRolePayload, UpdateRolePayload, DeleteRolePayload } from "./types"
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

export function useAvailableResourcesQuery() {
  return useQuery({
    queryKey: adminKeys.availableResources(),
    queryFn: fetchAvailableResources,
    staleTime: Infinity,
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
      successMessage: (result: Role) => `"${truncate(result.name)}" added`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Role) => {
        setRoles((old) => [...(old ?? []), result])
      },
    },
  )

  const update = useMutation(
    (payload: UpdateRolePayload) => updateRole(payload),
    {
      successMessage: (result: Role) => `"${truncate(result.name)}" updated`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Role) => {
        setRoles((old) => old?.map((r) => r.id === result.id ? result : r) ?? [])
        setMembers((old) =>
          old?.map((m) => m.role_id === result.id ? { ...m, role: result } : m) ?? []
        )
        if (result.id === memberRoleId) {
          queryClient.setQueryData<AdminBootstrapContext>(
            adminKeys.bootstrap(slug!),
            (old) => old && { ...old, memberRoleName: result.name, permissions: result.permissions },
          )
        }
      },
      onError: () => {
        queryClient.invalidateQueries({ queryKey: adminKeys.roles(slug!) })
      },
    },
  )

  const remove = useMutation(
    (payload: DeleteRolePayload) => deleteRole(payload),
    {
      successMessage: (_: void, args: DeleteRolePayload) =>
        `"${truncate(args.name)}" deleted`,
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: DeleteRolePayload) => {
        setRoles((old) => old?.filter((r) => r.id !== args.id) ?? [])
        queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) })
      },
      onError: () => {
        queryClient.invalidateQueries({ queryKey: adminKeys.roles(slug!) })
      },
    },
  )

  return { create, update, remove }
}
