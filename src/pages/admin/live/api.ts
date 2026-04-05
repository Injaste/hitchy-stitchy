import type { LiveLog, LiveLogType } from './types'
import { mockLiveLogs } from './data'

// TODO: replace with live Supabase query
export async function fetchLiveLogs(eventId: string): Promise<LiveLog[]> {
  await new Promise((r) => setTimeout(r, 200))
  return mockLiveLogs
}

// TODO: replace with live Supabase query
export async function insertLiveLog(payload: {
  eventId: string
  memberId: string
  memberDisplayName: string
  role: string
  type: LiveLogType
  msg: string
}): Promise<LiveLog> {
  await new Promise((r) => setTimeout(r, 200))
  return {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
}

// TODO: replace with live Supabase query
export async function markArrived(memberId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}

// TODO: replace with live Supabase query
export async function advanceCue(eventId: string, dayId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}
