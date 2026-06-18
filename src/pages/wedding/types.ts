import { z } from "zod"
import type { InvitationConfig, RSVPFieldConfig, RSVPMode, RSVPSectionConfig } from "../admin/invitation/types"
import type { ThemeConfig } from "./templates/types"

export interface PublicEventConfig {
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
  published_page: {
    id: string
    theme_slug: string | null
    config: ThemeConfig
  } | null
}


export interface RSVPFormData {
  name: string
  phone: string
  guestCount: number
  message?: string
  /** Private-mode gate code (private pages). */
  code?: string
}

export interface RSVPSubmission {
  id: string
  event_id: string
  name: string
  phone: string
  guest_count: number
  message: string | null
  status: "pending" | "confirmed" | "cancelled"
  token: string
  created_at: string
  updated_at: string
}

export interface GetRSVPPayload {
  event_id: string
  id: string
  token: string
}

export interface SubmitRSVPPayload {
  invitation_id: string
  name: string
  phone: string
  guest_count: number
  message: string | null
  invite_code: string | null
}

export interface UpdateRSVPPayload {
  event_id: string
  phone: string
  token: string
  name: string | null
  guest_count: number | null
  message: string | null
}

export interface CancelRSVPPayload {
  event_id: string
  phone: string
  token: string
}

function buildMessageSchema({ visible, required }: RSVPFieldConfig) {
  if (!visible) return z.string().optional()
  const s = z.string().max(500)
  return required ? s.min(1, "Please enter a message") : s.optional()
}

export function buildRsvpSchema(
  config: RSVPSectionConfig,
  limits: { min: number; max: number },
  codeRequired = false
) {
  return z.object({
    name: z
      .string()
      .min(2, "Please enter at least 2 characters of your name")
      .max(100),

    phone: z
      .string()
      .regex(/^\+?[\d\s\-().]{7,20}$/, "Please enter a valid phone number"),

    guestCount: z
      .number()
      .min(limits.min, `Minimum ${limits.min} guest`)
      .max(limits.max, `Maximum ${limits.max} guests`),

    message: buildMessageSchema(config.fields.message),

    code: codeRequired
      ? z.string().min(1, "Please enter your invite code").max(40)
      : z.string().max(40).optional(),
  })
}

export type RSVPFormSchema = ReturnType<typeof buildRsvpSchema>