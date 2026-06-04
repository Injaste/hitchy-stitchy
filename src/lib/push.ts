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
      { onConflict: "endpoint" },
    )

  if (error) throw new Error(error.message)
}

export async function unsubscribeFromPush(memberId: string, eventId: string): Promise<void> {
  const registration = await navigator.serviceWorker.ready
  const sub = await registration.pushManager.getSubscription()
  if (!sub) return
  await sub.unsubscribe()

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", sub.endpoint)

  if (error) throw new Error(error.message)
}

export async function getPushSubscriptionStatus(
  memberId: string,
  eventId: string,
): Promise<"subscribed" | "unsubscribed" | "unsupported"> {
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
