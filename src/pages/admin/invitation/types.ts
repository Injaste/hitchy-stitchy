export type RSVPMode = 'public' | 'private' | 'both'

export interface RSVPFieldConfig {
  visible: boolean
  required: boolean
}

export interface RSVPFieldConfigWithCount extends RSVPFieldConfig {
  min: number
  max: number
}

export interface RSVPConfig {
  rsvp: {
    fields: {
      name: RSVPFieldConfig
      phone: RSVPFieldConfig
      guestCount: RSVPFieldConfigWithCount
      message: RSVPFieldConfig
    }
    confirmation_message: string
  }
}

export interface EventInvitation {
  id: string
  event_id: string
  couple_names: string | null
  event_date: string | null        // "yyyy-MM-dd"
  event_time_start: string | null  // display string e.g. "11:00 AM"
  event_time_end: string | null
  venue_name: string | null
  venue_address: string | null
  venue_map_embed_url: string | null
  venue_map_link: string | null
  rsvp_mode: RSVPMode
  rsvp_deadline: string | null     // "yyyy-MM-dd", null = no deadline
  config: RSVPConfig
  created_at: string
  updated_at: string
}

export interface UpdateInvitationPayload {
  event_id: string
  couple_names?: string | null
  event_date?: string | null
  event_time_start?: string | null
  event_time_end?: string | null
  venue_name?: string | null
  venue_address?: string | null
  venue_map_embed_url?: string | null
  venue_map_link?: string | null
  rsvp_mode?: RSVPMode
  rsvp_deadline?: string | null
  config?: RSVPConfig
}
