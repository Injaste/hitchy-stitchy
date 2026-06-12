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

export const STEPS = ["Details", "Dates", "Role"] as const
export type StepType = (typeof STEPS)[number]

/** One picked event day. `date` is "yyyy-MM-dd"; `label` is required. */
export interface EventDayInput {
  date: string
  label: string
}

export interface CreateDetailsData {
  display_name: string
  event_name: string
  slug: string
}

export interface CreateDatesData {
  days: EventDayInput[]
}

export interface CreateEventData extends CreateDetailsData, CreateDatesData { }

export interface CreateRoleData {
  role_name: string
}

export interface CreateEventPayload extends CreateEventData, CreateRoleData { }

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/

export const eventDaySchema = z.object({
  date: z.string().min(1),
  label: z
    .string()
    .trim()
    .min(1, "Add a label for this day.")
    .max(60, "Keep the label under 60 characters."),
})

export const stepDetailsSchema = z.object({
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
})

export type StepDetailsFormValues = z.infer<typeof stepDetailsSchema>

export const stepDatesSchema = z.object({
  days: z
    .array(eventDaySchema)
    .min(1, "Please select at least one event day."),
})

export type StepDatesFormValues = z.infer<typeof stepDatesSchema>

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
