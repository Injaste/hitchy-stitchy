import { supabase } from "@/lib/supabase"

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

async function getAuthUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Not authenticated")
  return user.id
}

export async function subscribeToPush(eventId: string): Promise<void> {
  const userId = await getAuthUserId()
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const sub = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
  })

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { member_id: userId, event_id: eventId, subscription: sub.toJSON() },
      { onConflict: "member_id,event_id" },
    )

  if (error) throw new Error(error.message)
}

export async function unsubscribeFromPush(eventId: string): Promise<void> {
  const userId = await getAuthUserId()
  const registration = await navigator.serviceWorker.ready
  const sub = await registration.pushManager.getSubscription()
  await sub?.unsubscribe()

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("member_id", userId)
    .eq("event_id", eventId)

  if (error) throw new Error(error.message)
}

export async function getPushSubscriptionStatus(
  eventId: string,
): Promise<"subscribed" | "unsubscribed" | "unsupported"> {
  if (!("PushManager" in window) || !("serviceWorker" in navigator)) return "unsupported"

  const userId = await getAuthUserId().catch(() => null)
  if (!userId) return "unsubscribed"

  const { data } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("member_id", userId)
    .eq("event_id", eventId)
    .maybeSingle()

  return data ? "subscribed" : "unsubscribed"
}
