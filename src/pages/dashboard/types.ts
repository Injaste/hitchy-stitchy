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
