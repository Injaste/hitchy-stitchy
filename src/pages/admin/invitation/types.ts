import type {
  RSVPMode,
  RSVPSectionConfig,
  InvitationConfig,
} from "@/pages/templates/types"

export type { RSVPMode, RSVPSectionConfig, InvitationConfig }

export interface EventInvitation {
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

export type DetailsDraft = Pick<EventInvitation,
  'groom_name' | 'bride_name' | 'event_date' |
  'event_time_start' | 'event_time_end' | 'venue_name' |
  'venue_address' | 'venue_map_link' | 'venue_map_embed_url' |
  'max_guests' | 'guest_count_min' | 'guest_count_max' | 'confirmation_message'
>

export type RSVPDraft = Pick<EventInvitation, 'rsvp_mode' | 'rsvp_deadline'> & {
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

