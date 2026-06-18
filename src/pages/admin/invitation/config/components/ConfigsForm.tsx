import { z } from "zod";
import { TIME_REGEX } from "@/pages/admin/types";
import { RSVP_MODES, type Invitation } from "../../types";

// Unified invitation schema: the RSVP settings, with the cross-field rules
// (deadline-needs-time, min ≤ max). Design fields are free-form content and aren't
// validated here — the validator simply ignores those extra keys on the form's
// value object. (The page name/title derives from segment/day, not the form.)
export const schema = z
  .object({
    rsvp_mode: z.enum(RSVP_MODES),
    rsvp_deadline_date: z
      .string()
      .nullable()
      .transform((v) => v?.trim() || null),
    rsvp_deadline_time: z
      .string()
      .refine((v) => v === "" || TIME_REGEX.test(v), "Please enter a valid time")
      .transform((v) => v.trim() || null),
    max_guests: z.preprocess(
      (v) => (v === "" || v == null ? null : Number(v)),
      z
        .number()
        .min(1, "Must be 1 or more")
        .max(10000, "Must be 10,000 or less")
        .nullable(),
    ),
    guest_count_min: z.coerce.number().min(1, "Must be 1 or more").max(99),
    guest_count_max: z.coerce.number().min(1, "Must be 1 or more").max(99),
    confirmation_message: z
      .string()
      .max(500, "Keep under 500 characters")
      .transform((v) => v.trim() || null),
    message_visible: z.boolean(),
    message_required: z.boolean(),
    private_code: z
      .string()
      .max(40, "Keep under 40 characters")
      .transform((v) => v.trim() || null),
  })
  .superRefine((data, ctx) => {
    if (data.rsvp_deadline_date && !data.rsvp_deadline_time) {
      ctx.addIssue({
        code: "custom",
        path: ["rsvp_deadline_time"],
        message: "Time is required when a deadline date is set",
      });
    }
    if (data.guest_count_max < data.guest_count_min) {
      ctx.addIssue({
        code: "custom",
        path: ["guest_count_max"],
        message: "Maximum guests cannot be less than the minimum",
      });
    }
    // A gated page needs a code for guests to unlock with.
    if (data.rsvp_mode !== "public" && !data.private_code) {
      ctx.addIssue({
        code: "custom",
        path: ["private_code"],
        message: "Set a code guests will enter to RSVP",
      });
    }
  });

export type ConfigFormValues = z.infer<typeof schema>;

// RSVP-tab keys — used to jump to the RSVP tab when a save is blocked there.
export const RSVP_FIELD_KEYS = new Set<string>([
  "rsvp_mode",
  "rsvp_deadline_date",
  "rsvp_deadline_time",
  "max_guests",
  "guest_count_min",
  "guest_count_max",
  "confirmation_message",
  "message_visible",
  "message_required",
  "private_code",
]);

const parseDeadline = (
  deadline: string | null,
): { date: string; time: string } => {
  if (!deadline) return { date: "", time: "" };
  // Normalise space-separated ("YYYY-MM-DD HH:MM") or ISO ("YYYY-MM-DDTHH:MM…") to a parseable string
  const d = new Date(deadline.trim().replace(" ", "T"));
  if (isNaN(d.getTime())) return { date: "", time: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  // Convert UTC back to local for display
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

// The RSVP-settings half of the form's defaultValues (the name + design halves
// are assembled in useInvitationEditForm).
export const rsvpDefaults = (invitation: Invitation) => {
  const { date, time } = parseDeadline(invitation.rsvp_deadline);
  return {
    rsvp_mode: invitation.rsvp_mode,
    rsvp_deadline_date: date,
    rsvp_deadline_time: time,
    max_guests: invitation.max_guests,
    guest_count_min: invitation.guest_count_min,
    guest_count_max: invitation.guest_count_max,
    confirmation_message: invitation.confirmation_message ?? "",
    message_visible: invitation.rsvp_config.rsvp.fields.message.visible,
    message_required: invitation.rsvp_config.rsvp.fields.message.required,
    private_code: invitation.private_code ?? "",
  };
};
