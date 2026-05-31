import { z } from "zod";
import { TIME_REGEX } from "../types";

export interface Timeline {
  id: string;
  event_id: string;
  day: string; // "yyyy-MM-dd"
  label: string | null;
  time_start: string; // "HH:mm"
  time_end: string | null;
  title: string;
  details: string | null;
  assignees: string[];
  created_at: string;
}

export interface TimelineLabelGroup {
  label: string | null;
  items: Timeline[];
}

export interface TimelineGroupedDay {
  day: string;
  labelGroups: TimelineLabelGroup[];
}

export interface TimelineGrouped {
  days: TimelineGroupedDay[];
  labels: string[];
}

export const timelineItemFormSchema = z
  .object({
    day: z.string().min(1, "Please select a day"),

    label: z
      .string()
      .max(100, "Please keep label short")
      .transform((v) => v.trim() || null),

    time_start: z.string().regex(TIME_REGEX, "Please enter a start time"),

    time_end: z
      .string()
      .refine(
        (val) => val === "" || TIME_REGEX.test(val),
        "Please enter a valid time",
      )
      .transform((val) => val.trim() || null),

    title: z
      .string()
      .min(1, "Please give this item a title")
      .max(200, "Please keep title short"),

    details: z
      .string()
      .max(1000, "Best to split to multiple timelines for long description")
      .transform((v) => v.trim() || null),

    assignees: z
      .array(z.string())
      .max(20, "You can only assign up to 20 roles"),
  })
  .refine(
    (data) => {
      if (!data.time_end) return true;
      return data.time_end > data.time_start;
    },
    {
      message: "End time must be later than the start time",
      path: ["time_end"],
    },
  );

export type TimelineItemFormValues = z.infer<typeof timelineItemFormSchema>;

export interface CreateTimelineItemPayload {
  event_id: string;
  day: string;
  label: string | null;
  time_start: string;
  time_end: string | null;
  title: string;
  details: string | null;
  assignees: string[];
}

export interface UpdateTimelineItemPayload {
  event_id: string;
  id: string;
  day: string;
  label: string | null;
  time_start: string;
  time_end: string | null;
  title: string;
  details: string | null;
  assignees: string[];
}

export interface DeleteTimelineItemPayload {
  event_id: string;
  id: string;
  title: string;
}
