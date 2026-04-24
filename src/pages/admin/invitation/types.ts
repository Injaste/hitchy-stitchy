import type { ThemePageConfig } from "@/pages/templates/themes"

export type RSVPMode = 'public' | 'private' | 'both'

export interface RSVPFieldConfig {
  visible: boolean
  required: boolean
}

export interface RSVPFieldConfigWithCount extends RSVPFieldConfig {
  min: number
  max: number
}

export interface RSVPSectionConfig {
  fields: {
    name: RSVPFieldConfig
    phone: RSVPFieldConfig
    guestCount: RSVPFieldConfigWithCount
    message: RSVPFieldConfig
  }
  confirmation_message: string
}

export interface AppearanceConfig {
  greeting?: string | null
  quote?: string | null
  quote_source?: string | null
  section_title?: string | null
  invitation_body?: string | null
  attire?: string | null
  blessings_name?: string | null
  blessings_label?: string | null
}

export interface InvitationConfig {
  rsvp: RSVPSectionConfig
  appearance?: AppearanceConfig
}

export interface EventInvitation {
  id: string
  event_id: string
  groom_name: string | null
  bride_name: string | null
  event_date: string | null        // "yyyy-MM-dd"
  event_time_start: string | null  // display string e.g. "11:00 AM"
  event_time_end: string | null
  venue_name: string | null
  venue_address: string | null
  venue_map_embed_url: string | null
  venue_map_link: string | null
  rsvp_mode: RSVPMode
  rsvp_deadline: string | null     // "yyyy-MM-dd", null = no deadline
  config: InvitationConfig
  created_at: string
  updated_at: string
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
  config?: InvitationConfig
}

export interface EventTheme {
  id: string
  name: string
  slug: string
  description: string | null
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EventPage {
  id: string
  event_id: string
  template_id: string | null
  name: string
  is_published: boolean
  config: ThemePageConfig
  created_at: string
  updated_at: string
  theme?: Pick<EventTheme, 'id' | 'name' | 'slug'> | null
}

export interface CreatePagePayload {
  event_id: string
  template_id: string
  name: string
  config: ThemePageConfig
}

export interface UpdatePagePayload {
  id: string
  name?: string
  config?: ThemePageConfig
}
