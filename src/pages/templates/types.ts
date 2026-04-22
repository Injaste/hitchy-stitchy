import { z } from "zod"

interface RSVPFieldConfig {
  visible: boolean
  required: boolean
}

interface RSVPFieldConfigWithCount extends RSVPFieldConfig {
  min: number
  max: number
}

export interface RSVPConfig {
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
  rsvp: RSVPConfig
  appearance?: AppearanceConfig
}

// Matches event_invitation + published event_themes — snake_case = DB columns
export interface PublicEventConfig {
  id: string
  event_id: string
  groom_name: string | null
  bride_name: string | null
  event_date: string | null        // "yyyy-MM-dd"
  event_time_start: string | null
  event_time_end: string | null
  venue_name: string | null
  venue_address: string | null
  venue_map_embed_url: string | null
  venue_map_link: string | null
  rsvp_mode: "public" | "private" | "both"
  rsvp_deadline: string | null     // null = no deadline
  config: InvitationConfig
  published_page: {
    id: string
    theme_slug: string | null      // read from page config._theme_slug
    config: Record<string, unknown>
  } | null
}

// Matches event_rsvps row — snake_case = DB columns
export interface RSVPSubmission {
  id: string
  event_id: string
  name: string
  phone: string
  guest_count: number
  message: string | null
  status: "pending" | "confirmed" | "cancelled"
  source: "pool" | "public"
  cancel_token: string
  created_at: string
  updated_at: string
}

// Form field names — guestCount aligns with rsvpConfig.fields key
export interface RSVPFormData {
  name: string
  phone?: string
  guestCount?: number
  message?: string
}

export function buildRsvpSchema(config: RSVPConfig) {
  return z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),

    phone: config.fields.phone.visible
      ? config.fields.phone.required
        ? z.string().min(1, "Phone number is required").regex(/^\+?[\d\s\-().]{7,20}$/, "Enter a valid phone number")
        : z.string().regex(/^\+?[\d\s\-().]{7,20}$/, "Enter a valid phone number").optional().or(z.literal(""))
      : z.string().optional(),

    guestCount: config.fields.guestCount.visible
      ? config.fields.guestCount.required
        ? z.number()
          .min(config.fields.guestCount.min, `Minimum ${config.fields.guestCount.min} guest`)
          .max(config.fields.guestCount.max, `Maximum ${config.fields.guestCount.max} guests`)
        : z.number()
          .min(config.fields.guestCount.min)
          .max(config.fields.guestCount.max)
          .optional()
      : z.number().optional(),

    message: config.fields.message.visible
      ? config.fields.message.required
        ? z.string().min(1, "Please enter a message").max(500)
        : z.string().max(500).optional()
      : z.string().optional(),
  })
}

export type RSVPFormSchema = ReturnType<typeof buildRsvpSchema>
