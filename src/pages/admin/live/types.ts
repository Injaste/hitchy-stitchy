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
  event_id: string
  member_id?: string
  member_display_name?: string
  role: string
  type: LiveLogType
  msg: string
  created_at: string
}

export interface InsertLiveLogPayload {
  event_id: string
  member_id: string
  member_display_name: string
  role: string
  type: LiveLogType
  msg: string
}

export interface MarkArrivedPayload {
  member_id: string
  display_name: string
}

export interface AdvanceCuePayload {
  event_id: string
  day_id: string
}
