export interface EventDay {
  id: string       // "day-1", "day-2", etc — stable routing key
  date: Date
  label: string    // user-editable e.g. "The Ceremony"
  venue: string    // user-editable
}

export interface RSVPFieldConfig {
  visible: boolean
  required: boolean
}

export interface RSVPFormConfig {
  fields: {
    name: RSVPFieldConfig
    phone: RSVPFieldConfig
    guestsCount: RSVPFieldConfig
    dietaryNotes: RSVPFieldConfig
    mealChoice: RSVPFieldConfig
    message: RSVPFieldConfig
    email?: RSVPFieldConfig
  }
  mode: "open" | "pool" | "pool-open"
  guestMin: number
  guestMax: number
  confirmationMessage: string
}

export interface EventConfig {
  name: string
  dateRange: { from: Date; to: Date }
  days: EventDay[]          // derived — one per calendar day in range
  rsvpDeadlineEnabled: boolean
  rsvpDeadline: Date | null
  rsvpForm: RSVPFormConfig
}

export type NotificationPrefs = {
  eventStarted: boolean
  taskAssigned: boolean
  pinged: boolean
  upcomingEvent: boolean
  bridesmaidsCheckin: boolean
}

export interface GuestEntry {
  id: string
  name: string
  phone?: string
  status: "claimed" | "unclaimed"
}
