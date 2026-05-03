import { supabase } from "@/lib/supabase"
import type { PublicEventConfig, RSVPSubmission, RSVPFormData, InvitationConfig } from "./types"
import type { ThemePageConfig } from "./themes"

export async function fetchPublicEvent(slug: string): Promise<PublicEventConfig> {
  const { data: slugRow, error: slugError } = await supabase
    .from("event_slugs")
    .select("id")
    .eq("slug", slug)
    .single()

  if (slugError || !slugRow) throw new Error("Event not found")

  const event_id = slugRow.id as string

  const [invResult, pageResult] = await Promise.all([
    supabase.from("event_invitation").select("*").eq("event_id", event_id).single(),
    supabase.from("event_themes").select("id, config").eq("event_id", event_id).eq("is_published", true).maybeSingle(),
  ])

  if (invResult.error || !invResult.data) throw new Error("Invitation not found")

  const inv = invResult.data
  const page = pageResult.data ?? null

  return {
    id: inv.id,
    event_id: inv.event_id,
    groom_name: inv.groom_name,
    bride_name: inv.bride_name,
    event_date: inv.event_date,
    event_time_start: inv.event_time_start,
    event_time_end: inv.event_time_end,
    venue_name: inv.venue_name,
    venue_address: inv.venue_address,
    venue_map_embed_url: inv.venue_map_embed_url,
    venue_map_link: inv.venue_map_link,
    rsvp_mode: inv.rsvp_mode,
    rsvp_deadline: inv.rsvp_deadline,
    max_guests: inv.max_guests,
    guest_count_min: inv.guest_count_min,
    guest_count_max: inv.guest_count_max,
    confirmation_message: inv.confirmation_message,
    config: inv.config as InvitationConfig,
    published_page: page
      ? {
        id: page.id,
        theme_slug: (page.config as ThemePageConfig)._theme_slug ?? null,
        config: page.config as ThemePageConfig,
      }
      : null,
  }
}

export async function fetchRSVP(event_id: string, phone: string): Promise<RSVPSubmission | null> {
  const { data, error } = await supabase.rpc("get_rsvp", {
    p_event_id: event_id,
    p_phone: phone,
  })
  if (error) throw new Error(error.message)
  return (data as RSVPSubmission) ?? null
}

export async function submitRSVP(event_id: string, formData: RSVPFormData): Promise<RSVPSubmission> {
  const { data, error } = await supabase.rpc("submit_rsvp", {
    p_event_id: event_id,
    p_name: formData.name,
    p_phone: formData.phone ?? null,
    p_guest_count: formData.guestCount ?? 1,
    p_message: formData.message ?? null,
  })

  if (error) throw new Error(error.message)
  return data as RSVPSubmission
}

export async function updateRSVP(
  event_id: string,
  phone: string,
  cancel_token: string,
  formData: Partial<RSVPFormData>
): Promise<void> {
  const { error } = await supabase.rpc("update_rsvp", {
    p_event_id: event_id,
    p_phone: phone,
    p_token: cancel_token,
    p_name: formData.name ?? null,
    p_guest_count: formData.guestCount ?? null,
    p_message: formData.message ?? null,
  })

  if (error) throw new Error(error.message)
}

export async function deleteRSVP(event_id: string, phone: string, cancel_token: string): Promise<void> {
  const { error } = await supabase.rpc("cancel_rsvp", {
    p_event_id: event_id,
    p_phone: phone,
    p_token: cancel_token,
  })
  if (error) throw new Error(error.message)
}
