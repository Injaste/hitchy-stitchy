import { supabase } from "@/lib/supabase"
import type { EventPage, EventTheme, CreatePagePayload, UpdatePagePayload } from "./types"

const PAGE_FIELDS = "id, event_id, template_id, name, is_published, config, created_at, updated_at, theme:event_templates(id, name, slug)"
const THEME_FIELDS = "id, name, slug, description, config, is_active, created_at, updated_at"

export async function fetchPages(eventId: string): Promise<EventPage[]> {
  const { data, error } = await supabase
    .from("event_themes")
    .select(PAGE_FIELDS)
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as EventPage[]
}

export async function fetchThemes(): Promise<EventTheme[]> {
  const { data, error } = await supabase
    .from("event_templates")
    .select(THEME_FIELDS)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as EventTheme[]
}

export async function createPage(payload: CreatePagePayload): Promise<EventPage> {
  const { data, error } = await supabase
    .from("event_themes")
    .insert({
      event_id: payload.event_id,
      template_id: payload.template_id,
      name: payload.name,
      config: payload.config,
    })
    .select(PAGE_FIELDS)
    .single()

  if (error) throw new Error(error.message)
  return data as EventPage
}

export async function updatePage({ id, ...fields }: UpdatePagePayload): Promise<void> {
  const { error } = await supabase
    .from("event_themes")
    .update(fields)
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase
    .from("event_themes")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function publishPage(id: string, eventId: string): Promise<void> {
  const { error: unpubError } = await supabase
    .from("event_themes")
    .update({ is_published: false })
    .eq("event_id", eventId)
    .eq("is_published", true)

  if (unpubError) throw new Error(unpubError.message)

  const { error } = await supabase
    .from("event_themes")
    .update({ is_published: true })
    .eq("id", id)

  if (error) throw new Error(error.message)
}
