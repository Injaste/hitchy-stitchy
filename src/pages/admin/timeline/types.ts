import { z } from "zod";
import { TIME_REGEX } from "../types";

// Days are owned by the shared days module; the timeline only consumes them.
import type { EventDay } from "../days/types";

export interface Timeline {
  id: string
  event_id: string
  day: string        // "yyyy-MM-dd" — derived from the segment's day; kept for date math
  segment_id: string // → event_segments.id (the item's parent)
  label: string | null
  time_start: string        // "HH:mm"
  time_end: string | null
  title: string
  details: string | null
  assignees: string[]
  created_at: string
  started_at: string | null   // ISO timestamp — set when item is started
  ended_at: string | null     // ISO timestamp — set when item is ended
}

/** A grouping within a day (event_segments row). name === null is the default segment. */
export interface EventSegment {
  id: string
  event_id: string
  day_id: string
  name: string | null
  sort_order: number
}

export interface StartTimelinePayload {
  event_id: string
  id: string
}

export interface EndTimelinePayload {
  event_id: string
  id: string
}

export interface TimelineLabelGroup {
  label: string | null;
  items: Timeline[];
}

/** A segment with its items grouped by label. */
export interface TimelineGroupedSegment {
  id: string;
  name: string | null;
  sort_order: number;
  labelGroups: TimelineLabelGroup[];
}

export interface TimelineGroupedDay {
  date: string;       // "yyyy-MM-dd"
  day_id: string;
  label: string;
  segments: TimelineGroupedSegment[];
}

export interface TimelineGrouped {
  days: TimelineGroupedDay[];
  labels: string[];
  // Raw source rows kept so optimistic mutations can re-group without re-fetching.
  eventDays: EventDay[];
  eventSegments: EventSegment[];
}

export const timelineItemFormSchema = z
  .object({
    segment_id: z.string().min(1, "Please select a segment"),

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
  segment_id: string;
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
  segment_id: string;
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

export interface CreateSegmentPayload {
  event_id: string;
  day_id: string;
  name: string;
}

export interface UpdateSegmentPayload {
  event_id: string;
  id: string;
  name: string;
}

export interface DeleteSegmentPayload {
  event_id: string;
  id: string;
  name: string | null;
}

export interface ReorderSegmentsPayload {
  event_id: string;
  day_id: string;
  ids: string[];
}

