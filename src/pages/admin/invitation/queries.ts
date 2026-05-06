import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import {
  fetchInvitation,
  updateInvitation,
  fetchTemplates,
  fetchThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  publishTheme,
} from "./api"
import { useInvitationModalStore } from "./store/useInvitationModalStore"
import type {
  UpdateInvitationPayload,
  CreateThemePayload,
  UpdateThemePayload,
  Template,
} from "./types"
import { useInvitationStore } from "./store/useInvitationStore"

// Invitation
export function useInvitationQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.invitation(slug!),
    queryFn: () => fetchInvitation(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useUpdateInvitationMutation() {
  const { slug } = useAdminStore()
  const queryClient = useQueryClient()

  return useMutation(
    (payload: UpdateInvitationPayload) => updateInvitation(payload),
    {
      toast: { loading: "Saving...", success: "Saved", error: "Failed to save" },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: adminKeys.invitation(slug!) })
      },
    },
  )
}

// Templates + Themes
export function useTemplatesWithThemesQuery() {
  const { slug, eventId } = useAdminStore()

  const templatesQuery = useQuery({
    queryKey: adminKeys.themes(slug!),
    queryFn: fetchTemplates,
    enabled: !!slug,
    staleTime: Infinity,
  })

  const themesQuery = useQuery({
    queryKey: adminKeys.themes(slug!),
    queryFn: () => fetchThemes(eventId!),
    enabled: !!eventId && !!slug,
  })

  const data: Template[] | undefined =
    templatesQuery.data && themesQuery.data
      ? templatesQuery.data.map((template) => {
        const match = themesQuery.data.find((t) => t.template_id === template.id)
        return {
          ...template,
          themeId: match?.id ?? null,
          isPublished: match?.is_published ?? false,
        }
      })
      : undefined

  return {
    data,
    isLoading: templatesQuery.isLoading || themesQuery.isLoading,
    isError: templatesQuery.isError || themesQuery.isError,
    isRefetching: templatesQuery.isRefetching || themesQuery.isRefetching,
    refetch: () => {
      templatesQuery.refetch()
      themesQuery.refetch()
    },
  }
}

export function useThemesQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.themes(slug!),
    queryFn: () => fetchThemes(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useSelectedThemeQuery() {
  const { slug, eventId } = useAdminStore()
  const selectedThemeId = useInvitationStore((s) => s.selectedThemeId)

  return useQuery({
    queryKey: adminKeys.themes(slug!),
    queryFn: () => fetchThemes(eventId!),
    enabled: !!eventId && !!slug,
    select: (themes) => themes.find((t) => t.id === selectedThemeId) ?? null,
  })
}

export function useThemesMutations() {
  const { slug, eventId } = useAdminStore()
  const closeAll = useInvitationModalStore((s) => s.closeAll)
  const queryClient = useQueryClient()

  const invalidateThemes = () =>
    queryClient.invalidateQueries({ queryKey: adminKeys.themes(slug!) })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.themes(slug!) })
  }

  const create = useMutation(
    (payload: CreateThemePayload) => createTheme(payload),
    {
      successMessage: "Theme created",
      errorMessage: "Failed to create theme",
      onSuccess: () => { invalidateAll(); closeAll() },
    },
  )

  const update = useMutation(
    (payload: UpdateThemePayload) => updateTheme(payload),
    {
      toast: { loading: "Saving...", success: "Saved", error: "Failed to save" },
      onSuccess: () => invalidateThemes(),
    },
  )

  const remove = useMutation(
    (themeId: string) => deleteTheme(eventId!, themeId),
    {
      successMessage: "Theme deleted",
      errorMessage: "Failed to delete theme",
      onSuccess: () => { invalidateThemes(); closeAll() },
    },
  )

  const publish = useMutation(
    (themeId: string) => publishTheme(eventId!, themeId),
    {
      successMessage: "Theme saved",
      errorMessage: "Failed to save theme",
      onSuccess: () => { invalidateThemes(); closeAll() },
    },
  )

  return { create, update, remove, publish, eventId }
}