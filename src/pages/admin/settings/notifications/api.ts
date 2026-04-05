import type { NotificationPrefs } from './types'

const mockNotificationPrefs: NotificationPrefs = {
  eventStarted: true,
  taskAssigned: true,
  pinged: true,
  upcomingEvent: true,
  bridesmaidsCheckin: true,
}

// TODO: replace with live Supabase query
export async function fetchNotificationPrefs(
  eventId: string, memberId: string,
): Promise<NotificationPrefs> {
  await new Promise((r) => setTimeout(r, 200))
  return mockNotificationPrefs
}

// TODO: replace with live Supabase query
export async function updateNotificationPrefs(
  payload: { eventId: string; memberId: string; prefs: NotificationPrefs },
): Promise<NotificationPrefs> {
  await new Promise((r) => setTimeout(r, 200))
  return payload.prefs
}
