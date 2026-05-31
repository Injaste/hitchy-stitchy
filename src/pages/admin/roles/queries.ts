import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { truncate } from "@/lib/utils"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
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

type UpdateSnapshot = {
  roles: Role[] | undefined
  members: Member[] | undefined
  bootstrap: AdminBootstrapContext | undefined
}

type RemoveSnapshot = {
  roles: Role[] | undefined
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

  const update = useMutation<UpdateRolePayload, Role, UpdateSnapshot>(
    (payload: UpdateRolePayload) => updateRole(payload),
    {
      successMessage: (result: Role) => `"${truncate(result.name)}" updated`,
      errorMessage: (err) => err.message,
      onMutate: (payload) => {
        const roles = queryClient.getQueryData<Role[]>(adminKeys.roles(slug!))
        const members = queryClient.getQueryData<Member[]>(adminKeys.members(slug!))
        const bootstrap = queryClient.getQueryData<AdminBootstrapContext>(adminKeys.bootstrap(slug!))

        setRoles((old) => old?.map((r) => {
          if (r.id !== payload.id) return r
          return {
            ...r,
            ...(payload.name !== undefined && { name: payload.name }),
            ...(payload.permissions !== undefined && { permissions: payload.permissions }),
          }
        }) ?? [])

        setMembers((old) => old?.map((m) => {
          if (m.role_id !== payload.id) return m
          return {
            ...m,
            role: {
              ...m.role!,
              ...(payload.name !== undefined && { name: payload.name }),
              ...(payload.permissions !== undefined && { permissions: payload.permissions }),
            },
          }
        }) ?? [])

        if (payload.id === memberRoleId) {
          queryClient.setQueryData<AdminBootstrapContext>(
            adminKeys.bootstrap(slug!),
            (old) => old && {
              ...old,
              ...(payload.name !== undefined && { memberRoleName: payload.name }),
              ...(payload.permissions !== undefined && { permissions: payload.permissions }),
            },
          )
        }

        return { roles, members, bootstrap }
      },
      onSuccess: (result: Role) => {
        // Sync with server result (timestamps etc.)
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
      onError: (_err, _payload, context) => {
        if (context?.roles) setRoles(() => context.roles!)
        if (context?.members) setMembers(() => context.members!)
        if (context?.bootstrap) {
          queryClient.setQueryData(adminKeys.bootstrap(slug!), context.bootstrap)
        }
      },
    },
  )

  const remove = useMutation<DeleteRolePayload, void, RemoveSnapshot>(
    (payload: DeleteRolePayload) => deleteRole(payload),
    {
      successMessage: (_: void, args: DeleteRolePayload) =>
        `"${truncate(args.name)}" deleted`,
      errorMessage: (err) => err.message,
      onMutate: (payload) => {
        const roles = queryClient.getQueryData<Role[]>(adminKeys.roles(slug!))
        setRoles((old) => old?.filter((r) => r.id !== payload.id) ?? [])
        return { roles }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) })
      },
      onError: (_err, _payload, context) => {
        if (context?.roles) setRoles(() => context.roles!)
      },
    },
  )

  return { create, update, remove }
}
