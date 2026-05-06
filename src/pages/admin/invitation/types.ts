import type { ThemeConfig } from "@/pages/templates/themes/types"

export type RSVPMode = "public" | "private" | "both"

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

export interface Invitation {
  id: string
  event_id: string
  groom_name: string | null
  bride_name: string | null
  event_date: string | null
  event_time_start: string | null
  event_time_end: string | null
  venue_name: string | null
  venue_address: string | null
  venue_map_embed_url: string | null
  venue_map_link: string | null
  rsvp_mode: RSVPMode
  rsvp_deadline: string | null
  max_guests: number | null
  guest_count_min: number
  guest_count_max: number
  confirmation_message: string
  config: InvitationConfig
  created_at: string
  updated_at: string
}

export type DetailsDraft = Pick<
  Invitation,
  | "groom_name"
  | "bride_name"
  | "event_date"
  | "event_time_start"
  | "event_time_end"
  | "venue_name"
  | "venue_address"
  | "venue_map_link"
  | "venue_map_embed_url"
  | "max_guests"
  | "guest_count_min"
  | "guest_count_max"
  | "confirmation_message"
>

export type RSVPDraft = Pick<
  Invitation,
  "rsvp_mode" | "rsvp_deadline"
> & {
  config: RSVPSectionConfig
}

export interface UpdateInvitationPayload {
  event_id: string
  groom_name?: string | null
  bride_name?: string | null
  event_date?: string | null
  event_time_start?: string | null
  event_time_end?: string | null
  venue_name?: string | null
  venue_address?: string | null
  venue_map_embed_url?: string | null
  venue_map_link?: string | null
  rsvp_mode?: RSVPMode
  rsvp_deadline?: string | null
  max_guests?: number | null
  guest_count_min?: number
  guest_count_max?: number
  confirmation_message?: string
  config?: InvitationConfig
}

export interface Template {
  id: string
  name: string
  slug: string
  description: string | null
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
  themeId: string | null
  isPublished: boolean
}

export interface Theme {
  id: string
  event_id: string
  template_id: string | null
  name: string
  is_published: boolean
  config: ThemeConfig
  created_at: string
  updated_at: string
  template?: Pick<Template, "id" | "name" | "slug"> | null
}

export interface CreateThemePayload {
  event_id: string
  template_id: string
  name: string
}

export interface UpdateThemePayload {
  event_id: string
  id: string
  name?: string
  config?: ThemeConfig
}