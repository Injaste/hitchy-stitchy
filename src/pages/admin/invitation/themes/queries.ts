import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import {
  fetchTemplates,
  fetchThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  publishTheme,
} from "./api"
import { useThemesModalStore } from "../store/useThemesModalStore"
import type { CreateThemePayload, UpdateThemePayload } from "./types"

export function useTemplatesQuery() {
  const { slug } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.themes(slug!),
    queryFn: fetchTemplates,
    enabled: !!slug,
    staleTime: Infinity,
  })
}

export function useThemesQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.pages(slug!),
    queryFn: () => fetchThemes(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useThemesMutations() {
  const { slug, eventId } = useAdminStore()
  const closeAll = useThemesModalStore((s) => s.closeAll)
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: adminKeys.pages(slug!) })

  const create = useMutation(
    (payload: CreateThemePayload) => createTheme(payload),
    {
      successMessage: "Theme created",
      errorMessage: "Failed to create theme",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const remove = useMutation(
    (id: string) => deleteTheme(id),
    {
      successMessage: "Theme deleted",
      errorMessage: "Failed to delete theme",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const publish = useMutation(
    (id: string) => publishTheme(id),
    {
      successMessage: "Theme published",
      errorMessage: "Failed to publish theme",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  return { create, remove, publish, eventId }
}

export function useUpdateThemeConfigMutation() {
  const { slug } = useAdminStore()
  const queryClient = useQueryClient()

  return useMutation(
    (payload: UpdateThemePayload) => updateTheme(payload),
    {
      toast: { loading: "Saving...", success: "Saved", error: "Failed to save" },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: adminKeys.pages(slug!) })
      },
    },
  )
}
