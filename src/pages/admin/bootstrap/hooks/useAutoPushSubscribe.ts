import { useEffect } from "react"
import { useAdminStore } from "../../store/useAdminStore"
import { getPushSubscriptionStatus, subscribeToPush } from "../../settings/notifications/api"

/**
 * Default-on push enrollment. Once a member has granted browser notification
 * permission (the one-time, per-device prompt), every event they enter should
 * subscribe automatically — they never tap "Enable" again. Mounted in the
 * bootstrap layer, so it fires once per event-context mount (i.e. per event
 * entered), not per inner-page navigation.
 *
 * Permission is never requested here — that's the first-run gate's job (a tap is
 * required, especially on iOS). This only acts when permission is already
 * "granted".
 *
 * Write guard: getPushSubscriptionStatus queries by the device's LIVE endpoint,
 * so it returns "unsubscribed" both when no row exists yet AND when the browser
 * rotated the endpoint (leaving a stale DB row). Subscribing only in that case
 * keeps endpoints fresh while writing nothing on the common already-subscribed
 * path.
 */
export function useAutoPushSubscribe() {
  const { memberId, eventId, slug } = useAdminStore()

  useEffect(() => {
    if (!memberId || !eventId) return
    if (!("Notification" in window) || !("PushManager" in window)) return
    if (Notification.permission !== "granted") return

    getPushSubscriptionStatus(memberId, eventId)
      .then((status) => {
        if (status === "unsubscribed") return subscribeToPush(memberId, eventId, slug)
      })
      .catch(() => {})
  }, [memberId, eventId, slug])
}
