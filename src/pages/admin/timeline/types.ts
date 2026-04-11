import { z } from "zod"

export interface TimelineItem {
  id: string
  eventId: string
  day: string        // "yyyy-MM-dd"
  label: string | null
  timeStart: string        // "HH:mm"
  timeEnd: string | null
  title: string
  description: string | null
  notes: string | null
  assignees: string[]      // event_roles.id[]
  createdAt: string
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
  label: z.string(),
  timeStart: z.string().regex(TIME_REGEX, "Invalid time format").transform(normalizeTime),
  timeEnd: z.string().refine(
    (val) => val === "" || TIME_REGEX.test(val),
    "Invalid time format",
  ).transform((val) => (val ? normalizeTime(val) : val)),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long"),
  notes: z.string().max(1000, "Notes are too long"),
  assignees: z.array(z.string()),
}).refine(
  (data) => {
    if (!data.timeEnd) return true
    return data.timeEnd >= data.timeStart
  },
  { message: "End time must be after start time", path: ["timeEnd"] },
)

export type TimelineItemFormValues = z.infer<typeof timelineItemFormSchema>

export interface CreateTimelineItemPayload {
  eventId: string
  day: string
  label: string | null
  timeStart: string
  timeEnd: string | null
  title: string
  description: string | null
  notes: string | null
  assignees: string[]
}

export interface UpdateTimelineItemPayload {
  id: string
  day: string
  label?: string | null
  timeStart?: string
  timeEnd?: string | null
  title?: string
  description?: string | null
  notes?: string | null
  assignees?: string[]
}

export function toTimelinePayload(values: TimelineItemFormValues) {
  return {
    day: values.day,
    label: values.label || null,
    timeStart: values.timeStart,
    timeEnd: values.timeEnd || null,
    title: values.title,
    description: values.description || null,
    notes: values.notes || null,
    assignees: values.assignees,
  }
}