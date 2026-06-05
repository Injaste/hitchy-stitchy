import { useQuery } from "@tanstack/react-query"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { fetchAccessGroups, fetchResources } from "./api"

export function useAccessGroupsQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.accessGroups(slug!),
    queryFn: () => fetchAccessGroups(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useResourcesQuery() {
  return useQuery({
    queryKey: adminKeys.availableResources(),
    queryFn: fetchResources,
    staleTime: Infinity,
  })
}
