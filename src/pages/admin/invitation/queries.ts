import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { adminKeys } from "@/pages/admin/lib/queryKeys";
import {
  fetchInvitation,
  updateInvitation,
  fetchTemplates,
  fetchThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  publishTheme,
} from "./api";
import type {
  UpdateInvitationPayload,
  CreateThemePayload,
  UpdateThemePayload,
  Template,
  Theme,
  TemplateTheme,
  Invitation,
} from "./types";
import { themeRegistry } from "@/pages/wedding/templates";
import type { ThemeRegistryEntry } from "@/pages/wedding/templates/types";

export interface SelectedTemplateTheme {
  theme: Theme;
  template: Template;
  entry: ThemeRegistryEntry;
}

// Invitation
export function useInvitationQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.invitation(slug!),
    queryFn: () => fetchInvitation(eventId!),
    enabled: !!eventId && !!slug,
  });
}

export function useInvitationMutation() {
  const { slug } = useAdminStore();
  const queryClient = useQueryClient();

  const update = useMutation(
    (payload: UpdateInvitationPayload) => updateInvitation(payload),
    {
      toast: {
        loading: "Saving...",
        success: "Saved",
        error: "Failed to save",
      },
      onSuccess: (result: Invitation) => {
        queryClient.setQueryData<Invitation>(
          adminKeys.invitation(slug!),
          result,
        );
      },
    },
  );

  return { update };
}

// Templates + Themes
export function useTemplatesWithThemesQuery() {
  const { slug, eventId } = useAdminStore();

  const templatesQuery = useQuery({
    queryKey: adminKeys.templates(slug!),
    queryFn: fetchTemplates,
    enabled: !!slug,
    staleTime: Infinity,
  });

  const themesQuery = useQuery({
    queryKey: adminKeys.themes(slug!),
    queryFn: () => fetchThemes(eventId!),
    enabled: !!eventId && !!slug,
  });

  const data: TemplateTheme[] | undefined =
    templatesQuery.data && themesQuery.data
      ? templatesQuery.data.map((template) => {
          const match = themesQuery.data.find(
            (t) => t.template_id === template.id,
          );

          return {
            ...template,
            theme_id: match?.id ?? null,
            theme_name: match?.name ?? null,
            theme_updated_at: match?.updated_at ?? null,
            published_at: match?.published_at ?? null,
          };
        })
      : undefined;

  return {
    data,
    isLoading: templatesQuery.isLoading || themesQuery.isLoading,
    isError: templatesQuery.isError || themesQuery.isError,
    isRefetching: templatesQuery.isRefetching || themesQuery.isRefetching,
    refetch: () => {
      templatesQuery.refetch();
      themesQuery.refetch();
    },
  };
}

export function useThemesQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.themes(slug!),
    queryFn: () => fetchThemes(eventId!),
    enabled: !!eventId && !!slug,
  });
}

export function useThemeWithTemplate(
  themeId: string | null,
): SelectedTemplateTheme | null {
  const { slug, eventId } = useAdminStore();

  const themesQuery = useQuery({
    queryKey: adminKeys.themes(slug!),
    queryFn: () => fetchThemes(eventId!),
    enabled: !!eventId && !!slug,
  });

  const templatesQuery = useQuery({
    queryKey: adminKeys.templates(slug!),
    queryFn: fetchTemplates,
    enabled: !!slug,
    staleTime: Infinity,
  });

  if (!themeId || !themesQuery.data || !templatesQuery.data) return null;

  const theme = themesQuery.data.find((t) => t.id === themeId);
  if (!theme || !theme.template_id) return null;

  const template = templatesQuery.data.find((t) => t.id === theme.template_id);
  if (!template) return null;

  const entry = themeRegistry[template.slug];
  if (!entry) return null;

  return { theme, template, entry };
}

export function useThemesMutations() {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();

  const invalidateThemes = () =>
    queryClient.invalidateQueries({ queryKey: adminKeys.themes(slug!) });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.templates(slug!) });
    queryClient.invalidateQueries({ queryKey: adminKeys.themes(slug!) });
  };

  const create = useMutation(
    (payload: CreateThemePayload) => createTheme(payload),
    {
      successMessage: "Theme created",
      errorMessage: "Failed to create theme",
      onSuccess: () => {
        invalidateAll();
      },
    },
  );

  const update = useMutation(
    (payload: UpdateThemePayload) => updateTheme(payload),
    {
      successMessage: "Saved",
      errorMessage: "Failed to save",
      onSuccess: () => invalidateThemes(),
    },
  );

  const remove = useMutation(
    (themeId: string) => deleteTheme(eventId!, themeId),
    {
      successMessage: "Theme deleted",
      errorMessage: "Failed to delete theme",
      onSuccess: () => {
        invalidateThemes();
      },
    },
  );

  const publish = useMutation(
    (themeId: string) => publishTheme(eventId!, themeId),
    {
      successMessage: "Theme saved",
      errorMessage: "Failed to save theme",
      onSuccess: () => {
        invalidateThemes();
      },
    },
  );

  return { create, update, remove, publish, eventId };
}
