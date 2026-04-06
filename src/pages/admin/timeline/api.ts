import type { TimelineEvent } from './types'
import { mockTimelineEvents } from './data'

// TODO: replace with live Supabase query
export async function fetchTimelineEvents(eventId: string): Promise<TimelineEvent[]> {
  await new Promise((r) => setTimeout(r, 200))

  return mockTimelineEvents;
}

// TODO: replace with live Supabase query
export async function createTimelineEvent(
  event: Omit<TimelineEvent, 'id'>,
): Promise<TimelineEvent> {
  await new Promise((r) => setTimeout(r, 200))
  return { ...event, id: crypto.randomUUID() }
}

// TODO: replace with live Supabase query
export async function updateTimelineEvent(
  event: TimelineEvent,
): Promise<TimelineEvent> {
  await new Promise((r) => setTimeout(r, 200))
  return event
}

// TODO: replace with live Supabase query
export async function deleteTimelineEvent(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}

// TODO: replace with live Supabase query
export async function startCue(eventId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}
