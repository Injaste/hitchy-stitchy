import { supabase } from "@/lib/supabase"
import type { Templates, Themes, CreateThemePayload, UpdateThemePayload } from "./types"

type RawTheme = Omit<Themes, "theme"> & { theme: Pick<Templates, "id" | "name" | "slug">[] | null }

function normalizeTheme(raw: RawTheme): Themes {
  return { ...raw, theme: raw.theme?.[0] ?? null }
}

export async function fetchTemplates(): Promise<Templates[]> {
  const { data, error } = await supabase
    .from("event_templates")
    .select("id, name, slug, description, config, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Templates[]
}

export async function fetchThemes(eventId: string): Promise<Themes[]> {
  const { data, error } = await supabase
    .from("event_themes")
    .select("id, event_id, template_id, name, is_published, config, created_at, updated_at, theme:event_templates(id, name, slug)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? [] as RawTheme[]).map(normalizeTheme)
}

export async function createTheme(payload: CreateThemePayload): Promise<void> {
  const { error } = await supabase.rpc("create_theme", {
    p_event_id: payload.event_id,
    p_template_id: payload.template_id,
  })

  if (error) throw new Error(error.message)
}

export async function updateTheme({ id, config }: UpdateThemePayload): Promise<void> {
  const { error } = await supabase.rpc("update_theme", {
    p_theme_id: id,
    p_config: config,
  })

  if (error) throw new Error(error.message)
}

export async function deleteTheme(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_theme", {
    p_theme_id: id,
  })

  if (error) throw new Error(error.message)
}

export async function publishTheme(id: string): Promise<void> {
  const { error } = await supabase.rpc("publish_theme", {
    p_theme_id: id,
  })

  if (error) throw new Error(error.message)
}
