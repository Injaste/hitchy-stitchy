import { useQuery } from "@tanstack/react-query"
import { useAdminStore } from "../store/useAdminStore"
import { adminKeys } from "../lib/queryKeys"
import { mockPermissions } from "./data"
// TODO: replace with live Supabase query
// import { fetchAllPermissions } from "./api"

export function usePermissionsQuery() {
  const { eventId, slug } = useAdminStore()

  return useQuery({
    queryKey: adminKeys.permissions(slug),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200))
      return mockPermissions
      // TODO: replace with live Supabase query
      // return fetchAllPermissions()
    },
    enabled: !!eventId && !!slug,
    staleTime: Infinity,
  })
}
