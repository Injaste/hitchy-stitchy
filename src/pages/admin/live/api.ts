import type {
  LiveLog,
  InsertLiveLogPayload,
  MarkArrivedPayload,
  AdvanceCuePayload,
} from './types'
import { mockLiveLogs } from './data'

// TODO: replace with live Supabase query
export async function fetchLiveLogs(eventId: string): Promise<LiveLog[]> {
  await new Promise((r) => setTimeout(r, 200))
  return mockLiveLogs
}

// TODO: replace with live Supabase query
export async function insertLiveLog(payload: InsertLiveLogPayload): Promise<LiveLog> {
  await new Promise((r) => setTimeout(r, 200))
  return {
    ...payload,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
}

// TODO: replace with live Supabase query
export async function markArrived(payload: MarkArrivedPayload): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}

// TODO: replace with live Supabase query
export async function advanceCue(payload: AdvanceCuePayload): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}
