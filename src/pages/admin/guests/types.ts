import { z } from "zod"

export type GuestStatus = "pending" | "confirmed" | "cancelled"
export type GuestSource = "private" | "public"

export interface Guest {
  id: string
  event_id: string
  invitation_id: string | null
  name: string
  phone: string | null
  guest_count: number
  message: string | null
  status: GuestStatus
  source: GuestSource
  invite_code: string | null
  created_at: string
  confirmed_at: string | null
  cancelled_at: string | null
  updated_at: string
}

export const guestFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name is too long"),
  // Optional for admin-entered guests (e.g. elderly relatives with no phone).
  // Empty → null so no-phone guests don't collide on UNIQUE(event_id, phone).
  // The PUBLIC RSVP form requires phone via its own schema (wedding/types.ts).
  phone: z
    .string()
    .max(40, "Phone is too long")
    .transform((v) => (v.trim() ? v.trim() : null)),
  guest_count: z.coerce
    .number()
    .min(1, "At least 1 guest")
    .max(999, "Guest count is too high"),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  message: z
    .string()
    .max(1000, "Message is too long")
    .transform((v) => (v.trim() ? v.trim() : null)),
})

export type GuestFormValues = z.infer<typeof guestFormSchema>

export interface CreateGuestPayload extends GuestFormValues { }

export interface UpdateGuestPayload {
  event_id: string
  id: string
  name: string
  phone: string | null
  guest_count: number
  message: string | null
  status: GuestStatus
  invite_code: string | null
}

// CSV import

export interface ParsedGuestRow {
  rowIndex: number // 1-based, excluding header
  values: GuestFormValues
  errors: string[] // row-level validation failures; empty = valid
}

export type ImportAction = "insert" | "update" | "skip"

export interface ResolvedGuestRow extends ParsedGuestRow {
  conflictWith: Guest | null
  action: ImportAction
}

export interface ImportResult {
  inserted: number
  updated: number
  skipped: number
  failed: Array<{ rowIndex: number; reason: string }>
}

export const STATUS_LABELS: Record<GuestStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
}