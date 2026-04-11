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

export interface TimelineItemFormValues {
  day: string;
  label: string;
  timeStart: string;
  timeEnd: string;
  title: string;
  description: string;
  notes: string;
  assignees: string[];
}

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