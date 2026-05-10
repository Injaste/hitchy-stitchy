import { supabase } from "@/lib/supabase"
import type {
  PublicEventConfig,
  RSVPSubmission,
  GetRSVPPayload,
  SubmitRSVPPayload,
  UpdateRSVPPayload,
  CancelRSVPPayload,
} from "./types"
import type { ThemePageConfig } from "./templates"
import type { InvitationConfig } from "../admin/invitation/types"

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
        theme_slug: (page.config as ThemePageConfig).slug ?? null,
        config: page.config as ThemePageConfig,
      }
      : null,
  }
}

export async function fetchRSVP(payload: GetRSVPPayload): Promise<RSVPSubmission | null> {
  const { data, error } = await supabase.rpc("get_rsvp", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_token: payload.token,
  })
  if (error) throw new Error(error.message)
  return (data as RSVPSubmission) ?? null
}

export async function submitRSVP(payload: SubmitRSVPPayload): Promise<RSVPSubmission> {
  const { data, error } = await supabase.rpc("submit_rsvp", {
    p_event_id: payload.event_id,
    p_name: payload.name,
    p_phone: payload.phone,
    p_guest_count: payload.guest_count,
    p_message: payload.message,
    p_invite_code: payload.invite_code,
  })
  if (error) throw new Error(error.message)
  return data as RSVPSubmission
}

export async function updateRSVP(payload: UpdateRSVPPayload): Promise<void> {
  const { error } = await supabase.rpc("update_rsvp", {
    p_event_id: payload.event_id,
    p_phone: payload.phone,
    p_token: payload.token,
    p_name: payload.name,
    p_guest_count: payload.guest_count,
    p_message: payload.message,
  })
  if (error) throw new Error(error.message)
}

export async function deleteRSVP(payload: CancelRSVPPayload): Promise<void> {
  const { error } = await supabase.rpc("cancel_rsvp", {
    p_event_id: payload.event_id,
    p_phone: payload.phone,
    p_token: payload.token,
  })
  if (error) throw new Error(error.message)
}
