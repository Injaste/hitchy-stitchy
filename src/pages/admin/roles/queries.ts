import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { useRoleModalStore } from "./hooks/useRoleModalStore"
import { fetchRoles, createRole, updateRole, deleteRole } from "./api"
import type { CreateRolePayload, UpdateRolePayload, DeleteRolePayload } from "./types"

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
    queryClient.invalidateQueries({ queryKey: adminKeys.timeline(slug!) })
  }

  const create = useMutation(
    (payload: CreateRolePayload) => createRole(payload),
    {
      successMessage: "Role created",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const update = useMutation(
    (payload: UpdateRolePayload) => updateRole(payload),
    {
      successMessage: "Role updated",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const remove = useMutation(
    (payload: DeleteRolePayload) => deleteRole(payload),
    {
      successMessage: "Role deleted",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  return { create, update, remove }
}
