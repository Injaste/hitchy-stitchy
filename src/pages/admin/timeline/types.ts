export interface TimelineAssignee {
  roleId: string
  roleName: string
  roleShortName: string
}

export interface TimelineEvent {
  id: string
  eventId: string
  dayId: string
  timeStart: string
  title: string
  description?: string
  notes?: string
  isMainEvent: boolean
  startedAt?: string
  assignees: TimelineAssignee[]
}
