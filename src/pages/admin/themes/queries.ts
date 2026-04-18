import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { usePagesModalStore } from "./hooks/usePagesModalStore"
import { fetchPages, fetchThemes, createPage, updatePage, deletePage, publishPage } from "./api"
import type { CreatePagePayload, UpdatePagePayload } from "./types"

export function usePagesQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.pages(slug!),
    queryFn: () => fetchPages(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useThemesQuery() {
  const { slug } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.themes(slug!),
    queryFn: fetchThemes,
    enabled: !!slug,
    staleTime: Infinity,
  })
}

export function usePagesMutations() {
  const { slug, eventId } = useAdminStore()
  const closeAll = usePagesModalStore((s) => s.closeAll)
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: adminKeys.pages(slug!) })

  const create = useMutation(
    (payload: CreatePagePayload) => createPage(payload),
    {
      successMessage: "Page created",
      errorMessage: "Failed to create page",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const rename = useMutation(
    (payload: UpdatePagePayload) => updatePage(payload),
    {
      successMessage: "Page renamed",
      errorMessage: "Failed to rename page",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const remove = useMutation(
    (id: string) => deletePage(id),
    {
      successMessage: "Page deleted",
      errorMessage: "Failed to delete page",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const publish = useMutation(
    (id: string) => publishPage(id, eventId!),
    {
      successMessage: "Page published",
      errorMessage: "Failed to publish page",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  return { create, rename, remove, publish }
}
