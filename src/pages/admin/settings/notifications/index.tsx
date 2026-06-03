import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "../../store/useAdminStore"
import {
  getPushSubscriptionStatus,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push"
import type { PushStatus } from "./types"

export function NotificationsSection() {
  const { eventId } = useAdminStore()
  const [status, setStatus] = useState<PushStatus>("loading")
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (!eventId) return
    if (!("Notification" in window) || !("PushManager" in window)) {
      setStatus("unsupported")
      return
    }
    setPermission(Notification.permission)
    getPushSubscriptionStatus(eventId).then(setStatus)
  }, [eventId])

  const enable = async () => {
    setIsPending(true)
    try {
      const perm = permission === "granted"
        ? "granted"
        : await Notification.requestPermission()
      setPermission(perm)
      if (perm !== "granted") return
      await subscribeToPush(eventId)
      setStatus("subscribed")
    } finally {
      setIsPending(false)
    }
  }

  const disable = async () => {
    setIsPending(true)
    try {
      await unsubscribeFromPush(eventId)
      setStatus("unsubscribed")
    } finally {
      setIsPending(false)
    }
  }

  if (status === "unsupported") {
    return <p className="text-sm text-muted-foreground">Push notifications aren't supported on this browser.</p>
  }

  if (status === "subscribed") {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Push Notifications</h3>
        <Button size="sm" variant="outline" disabled>Enabled on this device</Button>
        <div>
          <button
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            disabled={isPending}
            onClick={disable}
          >
            Disable
          </button>
        </div>
      </div>
    )
  }

  const blocked = permission === "denied"

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Push Notifications</h3>
      <p className="text-xs text-muted-foreground">
        {blocked
          ? "Notifications are blocked in your browser settings. You'll need to allow them there first."
          : "Get notified on this device when a timeline item goes live."}
      </p>
      <Button
        size="sm"
        disabled={isPending || status === "loading" || blocked}
        onClick={enable}
      >
        Enable on this device
      </Button>
    </div>
  )
}
