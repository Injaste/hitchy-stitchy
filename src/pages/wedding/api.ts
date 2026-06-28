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

export async function fetchPublicEvent(
  slug: string,
  linkSlug?: string | null,
): Promise<PublicEventConfig> {
  // Per-(day, segment) model render, resolved by slug + optional link_slug.
  const { data, error } = await supabase.rpc("get_public_invitation", {
    p_slug: slug,
    p_link_slug: linkSlug ?? null,
  })

  if (error || !data) throw new Error("Event not found")

  return {
    id: data.id,
    event_id: data.event_id,
    event_date: data.event_date,
    event_time_start: data.event_time_start,
    event_time_end: data.event_time_end,
    rsvp_mode: data.rsvp_mode,
    rsvp_deadline: data.rsvp_deadline,
    max_guests: data.max_guests,
    guest_count_min: data.guest_count_min,
    guest_count_max: data.guest_count_max,
    confirmation_message: data.confirmation_message,
    config: data.config as InvitationConfig,
    published_page: data.published_page
      ? {
        id: data.published_page.id,
        theme_slug: data.published_page.theme_slug ?? null,
        config: data.published_page.config as ThemePageConfig,
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
    p_invitation_id: payload.invitation_id,
    p_fields: {
      name: payload.name,
      phone: payload.phone,
      guest_count: payload.guest_count,
      message: payload.message,
    },
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
    p_fields: {
      name: payload.name,
      guest_count: payload.guest_count,
      message: payload.message,
    },
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
