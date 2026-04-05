import type { AppearanceConfig } from './types'

const mockAppearance: AppearanceConfig = {
  templateId: 'classic-garden',
  primaryColor: '#b58863',
}

// TODO: replace with live Supabase query
export async function fetchAppearance(eventId: string): Promise<AppearanceConfig> {
  await new Promise((r) => setTimeout(r, 200))
  return mockAppearance
}

// TODO: replace with live Supabase query
export async function updateAppearance(
  payload: { eventId: string; config: AppearanceConfig },
): Promise<AppearanceConfig> {
  await new Promise((r) => setTimeout(r, 200))
  return payload.config
}
