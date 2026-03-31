import { z } from "zod"
import type { RSVPFormConfig } from "@/pages/planner/features/settings/types"

export function buildRsvpSchema(config: RSVPFormConfig) {
  return z.object({
    // name — always present, always required
    name: z.string().min(2, "Name must be at least 2 characters").max(100),

    // phone — special validation, only if visible
    phone: config.fields.phone.visible
      ? config.fields.phone.required
        ? z.string()
          .min(1, "Phone number is required")
          .regex(/^\+?[\d\s\-().]{7,20}$/, "Enter a valid phone number")
        : z.string()
          .regex(/^\+?[\d\s\-().]{7,20}$/, "Enter a valid phone number")
          .optional()
          .or(z.literal(""))
      : z.string().optional(),

    // email — special validation, only if visible
    email: config.fields.email?.visible
      ? config.fields.email.required
        ? z.string().min(1, "Email is required").email("Enter a valid email address")
        : z.string().email("Enter a valid email address").optional().or(z.literal(""))
      : z.string().optional(),

    // guestsCount — uses config min/max, only if visible
    guestsCount: config.fields.guestsCount.visible
      ? config.fields.guestsCount.required
        ? z.number()
          .min(config.guestMin, `Minimum ${config.guestMin} guest`)
          .max(config.guestMax, `Maximum ${config.guestMax} guests`)
        : z.number()
          .min(config.guestMin)
          .max(config.guestMax)
          .optional()
      : z.number().optional(),

    // dietaryNotes — plain text
    dietaryNotes: config.fields.dietaryNotes.visible
      ? config.fields.dietaryNotes.required
        ? z.string().min(1, "Please enter dietary requirements").max(500)
        : z.string().max(500).optional()
      : z.string().optional(),

    // message — plain text
    message: config.fields.message.visible
      ? config.fields.message.required
        ? z.string().min(1, "Please enter a message").max(500)
        : z.string().max(500).optional()
      : z.string().optional(),
  })
}

export type RSVPFormSchema = ReturnType<typeof buildRsvpSchema>

export interface RSVPFormData {
  name: string
  phone?: string
  email?: string
  guestsCount?: number
  dietaryNotes?: string
  message?: string
}

export interface PublicEventConfig {
  id: string
  slug: string
  name: string
  dateStart: Date
  dateEnd: Date
  groomName: string
  brideName: string
  venueName: string
  venueAddress: string
  venueMapEmbedUrl: string
  venueMapLink: string
  startTime: string
  endTime: string
  attire: string
  blessingsName: string
  blessingsLabel: string
  rsvpForm: RSVPFormConfig
  rsvpDeadline: Date | null
  rsvpDeadlineEnabled: boolean
}

export interface RSVPSubmission {
  id: string
  name: string
  phone: string
  guestsCount: number
  dietaryNotes?: string
  message?: string
  status: "Confirmed" | "Pending" | "Declined"
  cancelToken: string
  submittedAt: string
}

export type NewRSVPSubmission = Omit<RSVPSubmission, "id" | "status" | "submittedAt">
