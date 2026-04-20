import { z } from "zod"

export type GuestStatus = "pending" | "confirmed" | "cancelled"
export type GuestSource = "pool" | "public"

export interface Guest {
  id: string
  event_id: string
  name: string
  phone: string
  guest_count: number
  message: string | null
  status: GuestStatus
  source: GuestSource
  cancel_token: string
  created_at: string
  updated_at: string
}

export const guestFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name is too long"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .max(40, "Phone is too long"),
  guest_count: z
    .number()
    .int("Guest count must be a whole number")
    .min(1, "At least 1 guest")
    .max(999, "Guest count is too high"),
  message: z
    .string()
    .max(1000, "Message is too long")
    .transform((v) => (v.trim() ? v.trim() : null)),
})

export type GuestFormValues = z.infer<typeof guestFormSchema>

export interface CreateGuestPayload extends GuestFormValues {
  event_id: string
}

export interface UpdateGuestPayload extends GuestFormValues {
  id: string
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

export const SOURCE_LABELS: Record<GuestSource, string> = {
  pool: "Added by host",
  public: "Self-submitted",
}
