import { supabase } from "@/lib/supabase"
import type {
  Template,
  Invitation,
  EventDaySegment,
  CreateInvitationPayload,
  SaveInvitationPayload,
  DeleteInvitationPayload,
  UnpublishInvitationPayload,
} from "./types"

// Day segments for this event — labels the hub tiles + powers the create flow's
// segment picker. Minimal projection; the timeline owns the full segment shape.
export async function fetchEventSegments(
  eventId: string,
): Promise<EventDaySegment[]> {
  const { data, error } = await supabase
    .from("event_segments")
    .select("id, day_id, name")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as EventDaySegment[]
}

// ── New parallel model (event_invitations) ───────────────────────────────────
// One page per (event, day, segment). Reads via RLS; writes via the invitation
// CRUD RPCs. Returns every page for the event (the hub renders them all).
export async function fetchInvitations(
  eventId: string,
): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from("event_invitations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Invitation[]
}

export async function createInvitation(
  payload: CreateInvitationPayload,
): Promise<Invitation> {
  const { data, error } = await supabase.rpc("create_invitation", {
    p_event_id: payload.event_id,
    p_template_key: payload.template_key,
    p_day_id: payload.day_id,
    p_segment_id: payload.segment_id ?? null,
    p_link_slug: payload.link_slug ?? null,
  })

  if (error) throw new Error(error.message)
  return data as Invitation
}

// One RPC saves the draft (+ live settings); toPublish also promotes it to the
// live page in the same transaction (atomic publish). publishAt may be a future
// timestamp (scheduled publish) — the page stays hidden until it passes.
export async function saveInvitation(
  payload: SaveInvitationPayload,
  toPublish = false,
  publishAt: string | null = null,
): Promise<Invitation> {
  const { data, error } = await supabase.rpc("update_invitation", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_template_key: payload.template_key,
    p_draft_config: payload.draft_config,
    p_rsvp_mode: payload.rsvp_mode,
    p_rsvp_deadline: payload.rsvp_deadline,
    p_max_guests: payload.max_guests,
    p_guest_count_min: payload.guest_count_min,
    p_guest_count_max: payload.guest_count_max,
    p_confirmation_message: payload.confirmation_message,
    p_rsvp_config: payload.rsvp_config,
    p_private_code: payload.private_code,
    p_to_publish: toPublish,
    // Omit when null so the RPC default (now()) applies — immediate publish.
    ...(publishAt ? { p_publish_at: publishAt } : {}),
  })

  if (error) throw new Error(error.message)
  return data as Invitation
}

export async function deleteInvitation(
  payload: DeleteInvitationPayload,
): Promise<void> {
  const { error } = await supabase.rpc("delete_invitation", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  })

  if (error) throw new Error(error.message)
}

export async function unpublishInvitation(
  payload: UnpublishInvitationPayload,
): Promise<Invitation> {
  const { data, error } = await supabase.rpc("unpublish_invitation", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  })

  if (error) throw new Error(error.message)
  return data as Invitation
}

// Template catalogue — scoped to the event via get_templates RPC.
// Superadmins see draft templates; regular members see live-only.
export async function fetchTemplates(eventId: string): Promise<Template[]> {
  const { data, error } = await supabase.rpc("get_templates", {
    p_event_id: eventId,
  })

  if (error) throw new Error(error.message)
  return (data ?? []) as Template[]
}
