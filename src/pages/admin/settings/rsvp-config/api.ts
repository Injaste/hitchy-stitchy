import type { RSVPConfig } from './types'

const mockRSVPConfig: RSVPConfig = {
  mode: 'open',
  showPhone: true,
  showEmail: false,
  showDietary: true,
  showMessage: false,
  showGuestsCount: true,
  guestMin: 1,
  guestMax: 10,
}

// TODO: replace with live Supabase query
export async function fetchRSVPConfig(eventId: string): Promise<RSVPConfig> {
  await new Promise((r) => setTimeout(r, 200))
  return mockRSVPConfig
}

// TODO: replace with live Supabase query
export async function updateRSVPConfig(
  payload: { eventId: string; config: RSVPConfig },
): Promise<RSVPConfig> {
  await new Promise((r) => setTimeout(r, 200))
  return payload.config
}
