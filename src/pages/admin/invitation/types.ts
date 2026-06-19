import type { ThemeConfig } from "@/pages/wedding/templates/types"

export const RSVP_MODES = ["public", "private"] as const;
export type RSVPMode = typeof RSVP_MODES[number];

export interface RSVPFieldConfig {
  visible: boolean
  required: boolean
}

export interface RSVPSectionConfig {
  fields: {
    message: RSVPFieldConfig
  }
  // RSVP copy that lives with the form settings (not the theme design). Optional
  // for back-compat with rows saved before this field existed.
  messages?: {
    deadline_closed?: string | null
    /** Lead-in message for reserved guests; the link is appended on copy/share.
     *  Supports a {code} placeholder, filled with the page's invite code. */
    invite_message?: string | null
  }
}

// Default shown when the RSVP deadline has passed and no custom message is set.
export const DEFAULT_DEADLINE_MESSAGE =
  "RSVP submissions are now closed. Thank you to everyone who responded."

// Default invite-message lead-in. {code} is interpolated; the link is appended.
export const DEFAULT_INVITE_MESSAGE =
  "You're invited! RSVP with your phone and invite code {code}:"

// Resolve an invite-message lead-in: fill {code}, then append the link.
export function buildInviteMessage(
  template: string,
  link: string,
  code: string,
): string {
  return `${template.replaceAll("{code}", code).trim()} ${link}`
}

export interface InvitationConfig {
  rsvp: RSVPSectionConfig
}

// Readonly template catalogue (event_templates). `template_key` is the code
// registry key (matches a key in the template registry + Invitation.template_key).
export interface Template {
  id: string
  name: string
  template_key: string
  description: string | null
  field_config: Record<string, unknown>
  is_active: boolean
  event_id: string | null
  created_at: string
  updated_at: string
}

// ── New parallel model (event_invitations) — the redesign.
// Merges design (was event_themes) + RSVP config into one row. One page per
// (event, day, segment): day_id required, segment_id nullable (NULL = day-level).
// link_slug = the URL path under /:slug; NULL = the event root.
export interface Invitation {
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
  // Shared per-page gate code for private RSVP; null for public pages. The
  // public render RPC never returns it — admins (members) read it via RLS.
  private_code: string | null
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
  private_code: string | null
}

// Shared shape for the id-only invitation actions.
export interface InvitationIdPayload {
  event_id: string
  id: string
}

export type DeleteInvitationPayload = InvitationIdPayload
export type UnpublishInvitationPayload = InvitationIdPayload
