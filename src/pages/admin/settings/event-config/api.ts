import type { EventConfig } from './types'

const mockEventConfig: EventConfig = {
  eventName: 'Sarah & James Wedding',
  dateStart: '2026-04-04',
  dateEnd: '2026-04-05',
  timezone: 'Asia/Kuala_Lumpur',
}

// TODO: replace with live Supabase query
export async function fetchEventConfig(eventId: string): Promise<EventConfig> {
  await new Promise((r) => setTimeout(r, 200))
  return mockEventConfig
}

// TODO: replace with live Supabase query
export async function updateEventConfig(
  payload: { eventId: string; config: EventConfig },
): Promise<EventConfig> {
  await new Promise((r) => setTimeout(r, 200))
  return payload.config
}
