import { supabase } from "@/lib/supabase"
import type { NotificationPrefs, PushSubscriptionStatus } from "./types"

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const buf = new ArrayBuffer(raw.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i)
  return view
}

/**
 * Register this device's browser push subscription for the given event. Idempotent:
 * reuses the existing browser subscription and upserts on (endpoint, event_id), so a
 * device holds one row per event it has entered. Caller is responsible for ensuring
 * Notification.permission is "granted" first (pushManager.subscribe throws otherwise).
 */
export async function subscribeToPush(memberId: string, eventId: string, slug: string): Promise<void> {
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const sub = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
  })

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { member_id: memberId, event_id: eventId, slug, endpoint: sub.endpoint, subscription: sub.toJSON() },
      { onConflict: "endpoint,event_id" },
    )

  if (error) throw new Error(error.message)
}

export async function getPushSubscriptionStatus(
  memberId: string,
  eventId: string,
): Promise<PushSubscriptionStatus> {
  if (!("PushManager" in window) || !("serviceWorker" in navigator)) return "unsupported"

  const registration = await navigator.serviceWorker.ready
  const sub = await registration.pushManager.getSubscription()
  if (!sub) return "unsubscribed"

  const { data } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("endpoint", sub.endpoint)
    .eq("member_id", memberId)
    .eq("event_id", eventId)
    .maybeSingle()

  return data ? "subscribed" : "unsubscribed"
}

/**
 * Read the member's own notification feature flags. Own-row reads are allowed by
 * the event_members SELECT policy (user_id = auth.uid()), so no RPC is needed.
 * Returns the `notifications` object; missing keys mean default-on.
 */
export async function getNotificationPrefs(memberId: string): Promise<NotificationPrefs> {
  const { data, error } = await supabase
    .from("event_members")
    .select("preferences")
    .eq("id", memberId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  const prefs = (data?.preferences ?? {}) as Record<string, unknown>
  return (prefs.notifications ?? {}) as NotificationPrefs
}

/**
 * Merge feature flags into the member's preferences via the RPC (which preserves
 * other notification keys and unrelated preference keys). Returns the resulting
 * `notifications` object so the cache can reconcile to server truth.
 */
export async function setNotificationPrefs(
  eventId: string,
  notifications: NotificationPrefs,
): Promise<NotificationPrefs> {
  const { data, error } = await supabase.rpc("update_notification_preferences", {
    p_event_id: eventId,
    p_notifications: notifications,
  })

  if (error) throw new Error(error.message)
  const prefs = (data ?? {}) as Record<string, unknown>
  return (prefs.notifications ?? {}) as NotificationPrefs
}
