export const STEPS = ["Event", "Role"] as const;
export type StepType = (typeof STEPS)[number];

export interface CreateEventData {
  display_name: string
  event_name: string
  date_start: string
  date_end: string
  slug: string
}

export interface CreateRoleData {
  role_name: string
  role_short_name: string
}

export interface CreateEventPayload extends CreateEventData, CreateRoleData { }

export interface CreateEventResult {
  slug: string
  eventId: string
  memberId: string
}
