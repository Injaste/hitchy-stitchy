import { supabase } from "@/lib/supabase"
import type {
  Invitation,
  UpdateInvitationPayload,
  Template,
  Theme,
  CreateThemePayload,
  UpdateThemePayload,
  DeleteThemePayload,
  PublishThemePayload,
} from "./types"

// Invitation
export async function fetchInvitation(eventId: string): Promise<Invitation> {
  const { data, error } = await supabase
    .from("event_invitation")
    .select("id, event_id, event_date, event_time_start, event_time_end, rsvp_mode, rsvp_deadline, max_guests, guest_count_min, guest_count_max, confirmation_message, config, created_at, updated_at")
    .eq("event_id", eventId)
    .single()

  if (error) throw new Error(error.message)
  return data as Invitation
}

export async function updateInvitation(payload: UpdateInvitationPayload): Promise<Invitation> {
  const { data, error } = await supabase.rpc("update_invitation", {
    p_event_id: payload.event_id,
    p_event_date: payload.event_date,
    p_event_time_start: payload.event_time_start,
    p_event_time_end: payload.event_time_end,
    p_rsvp_mode: payload.rsvp_mode,
    p_rsvp_deadline: payload.rsvp_deadline,
    p_config: payload.config,
    p_max_guests: payload.max_guests,
    p_guest_count_min: payload.guest_count_min,
    p_guest_count_max: payload.guest_count_max,
    p_confirmation_message: payload.confirmation_message,
  })

  if (error) throw new Error(error.message)
  return data as Invitation
}

// Templates
export async function fetchTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from("event_templates")
    .select("id, name, slug, description, config, is_active, created_at, updated_at")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Template[]
}

// Themes
export async function fetchThemes(eventId: string): Promise<Theme[]> {
  const { data, error } = await supabase
    .from("event_themes")
    .select("id, event_id, template_id, name, published_at, config, created_at, updated_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Theme[]
}

export async function createTheme(payload: CreateThemePayload): Promise<Theme> {
  const { data, error } = await supabase.rpc("create_theme", {
    p_event_id: payload.event_id,
    p_template_id: payload.template_id,
    p_name: payload.name,
  })

  if (error) throw new Error(error.message)
  return data as Theme
}

export async function updateTheme(payload: UpdateThemePayload): Promise<Theme> {
  const { data, error } = await supabase.rpc("update_theme", {
    p_event_id: payload.event_id,
    p_theme_id: payload.id,
    p_name: payload.name ?? null,
    p_config: payload.config ?? null,
  })

  if (error) throw new Error(error.message)
  return data as Theme
}

export async function deleteTheme(payload: DeleteThemePayload): Promise<void> {
  const { error } = await supabase.rpc("delete_theme", {
    p_event_id: payload.event_id,
    p_theme_id: payload.id,
  })

  if (error) throw new Error(error.message)
}

export async function publishTheme(payload: PublishThemePayload): Promise<void> {
  const { error } = await supabase.rpc("publish_theme", {
    p_event_id: payload.event_id,
    p_theme_id: payload.id,
  })

  if (error) throw new Error(error.message)
}