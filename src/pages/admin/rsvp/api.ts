import type { RSVPEntry, RSVPStatus } from './types'
import { mockRSVPs } from './data'

// TODO: replace with live Supabase query
export async function fetchRSVPs(eventId: string): Promise<RSVPEntry[]> {
  await new Promise((r) => setTimeout(r, 200))
  return mockRSVPs
}

// TODO: replace with live Supabase query
export async function updateRSVPStatus(
  payload: { id: string; status: RSVPStatus },
): Promise<RSVPEntry> {
  await new Promise((r) => setTimeout(r, 200))
  const entry = mockRSVPs.find((r) => r.id === payload.id)!
  return { ...entry, status: payload.status, updatedAt: new Date().toISOString() }
}
