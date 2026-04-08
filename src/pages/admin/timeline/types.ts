export interface TimelineDay {
  id: string
  eventId: string
  day: string // "yyyy-MM-dd"
  createdAt: string
}

export interface TimelineItem {
  id: string
  eventId: string
  dayId: string
  day: string // "yyyy-MM-dd" joined from parent
  label: string | null
  timeStart: string // "HH:mm"
  timeEnd: string | null
  title: string
  description: string | null
  notes: string | null
  assignees: string[]
  createdAt: string
}

export interface TimelineLabelGroup {
  label: string | null
  items: TimelineItem[]
}

export interface TimelineSlot {
  timeStart: string
  labelGroups: TimelineLabelGroup[]
}

export interface TimelineGroupedDay {
  dayId: string
  day: string
  slots: TimelineSlot[]
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
  label?: string | null
  timeStart?: string
  timeEnd?: string | null
  title?: string
  description?: string | null
  notes?: string | null
  assignees?: string[]
}