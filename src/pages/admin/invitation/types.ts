import type { ThemeConfig } from "@/pages/wedding/templates/types"

export const RSVP_MODES = ["public", "private", "both"] as const;
export type RSVPMode = typeof RSVP_MODES[number];

export interface RSVPFieldConfig {
  visible: boolean
  required: boolean
}

export interface RSVPSectionConfig {
  fields: {
    message: RSVPFieldConfig
  }
}

export interface InvitationConfig {
  rsvp: RSVPSectionConfig
}

// Old per-event invitation (event_invitation singular). Still read by the guests
// feature for RSVP settings until the go-live cleanup repoints it.
export interface Invitation {
  id: string
  event_id: string
  event_date: string | null
  event_time_start: string | null
  event_time_end: string | null
  rsvp_mode: RSVPMode
  rsvp_deadline: string | null
  max_guests: number | null
  guest_count_min: number
  guest_count_max: number
  confirmation_message: string | null
  config: InvitationConfig
  created_at: string
  updated_at: string
}

// Readonly template catalogue (event_templates).
export interface Template {
  id: string
  name: string
  slug: string
  description: string | null
  field_config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── New parallel model (event_invitations) — the redesign.
// Merges design (was event_themes) + RSVP config into one row. One page per
// (event, day, segment): day_id required, segment_id nullable (NULL = day-level).
// link_slug = the URL path under /:slug; NULL = the event root.
export interface EventInvitation {
  id: string
  event_id: string
  day_id: string
  segment_id: string | null
  link_slug: string | null
  template_key: string
  // Design content: the working draft, and the published snapshot (null = never
  // published). RSVP settings below stay live (no publish step).
  draft_config: ThemeConfig
  published_config: ThemeConfig | null
  published_at: string | null
  rsvp_mode: RSVPMode
  rsvp_deadline: string | null
  max_guests: number | null
  guest_count_min: number
  guest_count_max: number
  confirmation_message: string | null
  rsvp_config: InvitationConfig
  created_at: string
  updated_at: string
}

// Minimal day-segment shape for the hub labels + the create flow's segment picker.
export interface EventDaySegment {
  id: string
  day_id: string
  name: string | null
}

export interface CreateInvitationPayload {
  event_id: string
  template_key: string
  day_id: string
  segment_id?: string | null
  link_slug?: string | null
}

// Whole-invitation save (decision A): design + RSVP config in one call.
// link_slug is set at create, not edited here.
export interface SaveInvitationPayload {
  event_id: string
  id: string
  template_key: string
  draft_config: ThemeConfig
  rsvp_mode: RSVPMode
  rsvp_deadline: string | null
  max_guests: number | null
  guest_count_min: number
  guest_count_max: number
  confirmation_message: string | null
  rsvp_config: InvitationConfig
}

// Shared shape for the id-only invitation actions.
export interface InvitationIdPayload {
  event_id: string
  id: string
}

export type DeleteInvitationPayload = InvitationIdPayload
export type UnpublishInvitationPayload = InvitationIdPayload
