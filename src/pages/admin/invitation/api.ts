import { supabase } from "@/lib/supabase"
import type {
  EventInvitation,
  UpdateInvitationPayload,
  EventPage,
  EventTheme,
  CreatePagePayload,
  UpdatePagePayload,
} from "./types"

const INVITATION_FIELDS = "id, event_id, groom_name, bride_name, event_date, event_time_start, event_time_end, venue_name, venue_address, venue_map_embed_url, venue_map_link, rsvp_mode, rsvp_deadline, config, created_at, updated_at"
const PAGE_FIELDS = "id, event_id, template_id, name, is_published, config, created_at, updated_at, theme:event_templates(id, name, slug)"
const THEME_FIELDS = "id, name, slug, description, config, is_active, created_at, updated_at"

type RawPage = Omit<EventPage, "theme"> & { theme: Pick<EventTheme, "id" | "name" | "slug">[] | null }

function normalizePage(raw: RawPage): EventPage {
  return { ...raw, theme: raw.theme?.[0] ?? null }
}

export async function fetchInvitation(eventId: string): Promise<EventInvitation> {
  const { data, error } = await supabase
    .from("event_invitation")
    .select(INVITATION_FIELDS)
    .eq("event_id", eventId)
    .single()

  if (error) throw new Error(error.message)
  return data as EventInvitation
}

export async function updateInvitation({ event_id, ...fields }: UpdateInvitationPayload): Promise<void> {
  const { error } = await supabase
    .from("event_invitation")
    .update(fields)
    .eq("event_id", event_id)

  if (error) throw new Error(error.message)
}

export async function fetchPages(eventId: string): Promise<EventPage[]> {
  const { data, error } = await supabase
    .from("event_themes")
    .select(PAGE_FIELDS)
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? [] as RawPage[]).map(normalizePage)
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
  return normalizePage(data as unknown as RawPage)
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
