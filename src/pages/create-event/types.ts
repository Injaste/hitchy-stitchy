export interface EventData {
  displayName: string
  eventName:   string
  dateStart:   string   // "2026-07-04"
  dateEnd:     string   // "2026-07-05"
  slug:        string
}

export interface RoleData {
  role:      string
  shortRole: string
}

export interface CreateEventPayload extends EventData, RoleData {}

export interface CreateEventResult {
  slug:     string
  eventId:  string
  memberId: string
}
