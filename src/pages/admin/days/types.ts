import { z } from "zod";

/** A calendar date of the event (event_days row). `date` is the day's identity;
 *  `label` is a required human name. Shared resource — owned here, consumed by
 *  the timeline (read) and managed from Event Settings. */
export interface EventDay {
  id: string;
  date: string; // "yyyy-MM-dd"
  label: string;
}

export interface CreateDayPayload {
  event_id: string;
  date: string; // "yyyy-MM-dd"
  label: string;
}

export interface UpdateDayPayload {
  event_id: string;
  id: string;
  label: string;
}

export interface DeleteDayPayload {
  event_id: string;
  id: string;
}

export const dayFormSchema = z.object({
  date: z.string().min(1, "Pick a date."),
  label: z
    .string()
    .trim()
    .min(1, "Add a label for this day.")
    .max(60, "Keep the label under 60 characters."),
});

export type DayFormValues = z.infer<typeof dayFormSchema>;
