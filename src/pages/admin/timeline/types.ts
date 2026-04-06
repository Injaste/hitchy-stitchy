export interface TimelineAssignee {
  roleId: string
  roleName: string
  roleShortName: string
}

export interface TimelineDay {
  dayId: string
  timelineSlot: TimeSlot[]
}

export interface TimeSlot {
  timeStart: string
  isMainEvent: boolean
  timelineSchedule: TimelineSchedule[]
}

export interface TimelineSchedule {
  id: string
  eventId: string
  title: string
  description?: string
  notes?: string
  startedAt?: string
  assignees: TimelineAssignee[]
}
