import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { useRoleModalStore } from "./hooks/useRoleModalStore"
import { fetchRoles, createRole, updateRole, deleteRole } from "./api"
import type { CreateRolePayload, UpdateRolePayload } from "./types"

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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.roles(slug!) })
    queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) })
  }

  const create = useMutation(
    (payload: CreateRolePayload) => createRole(payload),
    {
      successMessage: "Role created",
      errorMessage: "Failed to create role",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const update = useMutation(
    (payload: UpdateRolePayload) => updateRole(payload),
    {
      successMessage: "Role updated",
      errorMessage: "Failed to update role",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const remove = useMutation(
    (id: string) => deleteRole(id),
    {
      successMessage: "Role deleted",
      errorMessage: "Failed to delete role",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  return { create, update, remove }
}
