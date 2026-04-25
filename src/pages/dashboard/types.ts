export interface Event {
  id: string
  slug: string
  name: string
  date_start: string
  date_end: string
}

export interface EventsCount {
  active: number
  upcoming: number
}

export interface PendingInvite {
  id: string
  event_id: string
  display_name: string
  invited_at: string
  role_name: string | null
  event_name: string
  event_slug: string
  date_start: string
  date_end: string
}