import { z } from "zod"

export interface TimelineItem {
  id: string
  event_id: string
  day: string        // "yyyy-MM-dd"
  label: string | null
  time_start: string        // "HH:mm"
  time_end: string | null
  title: string
  description: string | null
  notes: string | null
  assignees: string[]      // event_roles.id[]
  created_at: string
}

export interface TimelineLabelGroup {
  label: string | null
  items: TimelineItem[]
}

export interface TimelineGroupedDay {
  day: string
  labelGroups: TimelineLabelGroup[]
}


const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/

const normalizeTime = (val: string) => val.slice(0, 5)

export const timelineItemFormSchema = z.object({
  day: z.string().min(1, "Day is required"),
  label: z.string().transform((v) => v || null),
  time_start: z.string().regex(TIME_REGEX, "Invalid time format").transform(normalizeTime),
  time_end: z.string().refine(
    (val) => val === "" || TIME_REGEX.test(val),
    "Invalid time format",
  ).transform((val) => (val ? normalizeTime(val) : null)),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").transform((v) => v || null),
  notes: z.string().max(1000, "Notes are too long").transform((v) => v || null),
  assignees: z.array(z.string()),
}).refine(
  (data) => {
    if (!data.time_end) return true
    return data.time_end >= data.time_start
  },
  { message: "End time must be after start time", path: ["time_end"] },
)

export type TimelineItemFormValues = z.infer<typeof timelineItemFormSchema>

export interface CreateTimelineItemPayload {
  event_id: string
  day: string
  label: string | null
  time_start: string
  time_end: string | null
  title: string
  description: string | null
  notes: string | null
  assignees: string[]
}

export interface UpdateTimelineItemPayload {
  id: string
  day: string
  label?: string | null
  time_start?: string
  time_end?: string | null
  title?: string
  description?: string | null
  notes?: string | null
  assignees?: string[]
}

