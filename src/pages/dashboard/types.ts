import { z } from "zod"

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface Event {
  id: string
  slug: string
  name: string
  date_start: string
  date_end: string
}

export interface EventsCount {
  active: number
  upcoming: number
}

// ─── Create Event ─────────────────────────────────────────────────────────────

export const STEPS = ["Event", "Role"] as const
export type StepType = (typeof STEPS)[number]

export interface CreateEventData {
  display_name: string
  event_name: string
  date_start: string
  date_end: string
  slug: string
}

export interface CreateRoleData {
  role_name: string
}

export interface CreateEventPayload extends CreateEventData, CreateRoleData { }

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/

export const stepEventSchema = z.object({
  display_name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be less than 50 characters."),
  event_name: z
    .string()
    .min(3, "Event name must be at least 3 characters.")
    .max(50, "Event name must be less than 50 characters."),
  slug: z
    .string()
    .regex(SLUG_REGEX, "Slug must be 3–50 chars, lowercase letters, numbers and hyphens only."),
  date_start: z.string(),
  date_end: z.string(),
}).refine((data) => Boolean(data.date_start && data.date_end), {
  message: "Please select your event dates.",
  path: ["date_start"],
})

export type StepEventFormValues = z.infer<typeof stepEventSchema>

export const stepRoleSchema = z
  .object({
    role: z.string().min(1, "Please select a role to continue."),
    customRole: z.string(),
  })
  .refine(
    (val) => val.role !== "Other" || (val.customRole ?? "").trim().length > 0,
    { message: "Please enter your role.", path: ["customRole"] },
  )

export type StepRoleFormValues = z.infer<typeof stepRoleSchema>
