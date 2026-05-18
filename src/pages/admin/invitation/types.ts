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

export interface UpdateInvitationPayload {
  event_id: string
  event_date?: string | null
  event_time_start?: string | null
  event_time_end?: string | null
  rsvp_mode?: RSVPMode
  rsvp_deadline?: string | null
  max_guests?: number | null
  guest_count_min?: number
  guest_count_max?: number
  confirmation_message?: string | null
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

export interface TemplateTheme {
  id: string
  name: string
  slug: string
  description: string | null
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string

  theme_id: string | null
  theme_name: string | null
  theme_updated_at: string | null
  is_published: boolean
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
