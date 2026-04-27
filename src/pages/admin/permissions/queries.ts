import { useQuery } from "@tanstack/react-query"
import { useAdminStore } from "../store/useAdminStore"
import { adminKeys } from "../lib/queryKeys"
import { fetchAllPermissions } from "./api"

export function usePermissionsQuery() {
  const { eventId, slug } = useAdminStore()

  return useQuery({
    queryKey: adminKeys.permissions(slug!),
    queryFn: fetchAllPermissions,
    enabled: !!eventId && !!slug,
    staleTime: Infinity,
  })
}