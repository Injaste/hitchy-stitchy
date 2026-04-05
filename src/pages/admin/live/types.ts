export type LiveLogType =
  | 'help_needed'
  | 'task_done'
  | 'running_late'
  | 'ready'
  | 'ping'
  | 'cue_started'
  | 'note'

export interface LiveLog {
  id: string
  eventId: string
  memberId?: string
  memberDisplayName?: string
  role: string
  type: LiveLogType
  msg: string
  createdAt: string
}
