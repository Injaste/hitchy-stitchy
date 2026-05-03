import { z } from "zod"
import type { ThemePageConfig } from "./themes"

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
}

export interface PublicEventConfig {
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
  published_page: {
    id: string
    theme_slug: string | null
    config: ThemePageConfig
  } | null
}

export interface RSVPSubmission {
  id: string
  event_id: string
  name: string
  phone: string
  guest_count: number
  message: string | null
  status: "pending" | "confirmed" | "cancelled"
  source: "private" | "public"
  cancel_token: string
  created_at: string
  updated_at: string
}

export interface RSVPFormData {
  name: string
  phone?: string
  guestCount?: number
  message?: string
}

export function buildRsvpSchema(
  config: RSVPSectionConfig,
  limits: { min: number; max: number }
) {
  return z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100),

    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\+?[\d\s\-().]{7,20}$/, "Enter a valid phone number"),

    guestCount: z
      .number()
      .min(limits.min, `Minimum ${limits.min} guest`)
      .max(limits.max, `Maximum ${limits.max} guests`),

    message: config.fields.message.visible
      ? config.fields.message.required
        ? z.string().min(1, "Please enter a message").max(500)
        : z.string().max(500).optional()
      : z.string().optional(),
  })
}

export type RSVPFormSchema = ReturnType<typeof buildRsvpSchema>