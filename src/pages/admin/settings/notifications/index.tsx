import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useAdminStore } from "../../store/useAdminStore"
import { subscribeToPush } from "./api"
import { useNotificationPrefsQuery, useSetNotificationPrefsMutation } from "./queries"
import { NOTIFICATION_FEATURES } from "./types"

type PermState = NotificationPermission | "unsupported"

const pushSupported = () => "Notification" in window && "PushManager" in window

export function NotificationsSection() {
  const { memberId, eventId, slug } = useAdminStore()
  const { data: prefs } = useNotificationPrefsQuery()
  const setPrefs = useSetNotificationPrefsMutation()
  const [permission, setPermission] = useState<PermState>("default")

  useEffect(() => {
    setPermission(pushSupported() ? Notification.permission : "unsupported")
  }, [])

  // Default-on by absence: a feature is enabled unless explicitly set to false.
  const featureEnabled = (key: string) => (prefs?.[key] ?? true) !== false
  const granted = permission === "granted"
  // The master reflects the whole pipeline: this device can receive (granted)
  // AND at least one feature is on. Device transport itself is automatic
  // (useAutoPushSubscribe), so there's no separate device toggle to fight it.
  const masterOn = granted && NOTIFICATION_FEATURES.some((f) => featureEnabled(f.key))

  const writeAll = (enabled: boolean) =>
    setPrefs.mutate(Object.fromEntries(NOTIFICATION_FEATURES.map((f) => [f.key, enabled])))

  const toggleMaster = async (next: boolean) => {
    if (!next) {
      writeAll(false)
      return
    }
    // Turning on must guarantee this device can actually receive: grab the
    // browser permission (if never asked) and register the subscription before
    // flipping the feature flags on.
    let perm = Notification.permission
    if (perm === "default") {
      perm = await Notification.requestPermission()
      setPermission(perm)
    }
    if (perm !== "granted") return
    subscribeToPush(memberId, eventId, slug).catch(() => {})
    writeAll(true)
  }

  const toggleFeature = (key: string, next: boolean) => setPrefs.mutate({ [key]: next })

  if (permission === "unsupported") {
    return (
      <p className="text-sm text-muted-foreground">
        Push notifications aren't supported on this browser.
      </p>
    )
  }

  const blocked = permission === "denied"

  return (
    <div className="space-y-5">
      <label className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">All notifications</p>
          <p className="text-xs text-muted-foreground">
            {blocked
              ? "Blocked in your browser settings — allow notifications there to turn these on."
              : "Receive push notifications on this device."}
          </p>
        </div>
        <Switch
          checked={masterOn}
          disabled={blocked || setPrefs.isPending}
          onCheckedChange={toggleMaster}
        />
      </label>

      <div className="space-y-3 border-t pt-4">
        {NOTIFICATION_FEATURES.map((feature) => (
          <label key={feature.key} className="flex items-center justify-between gap-4">
            <span className="text-sm">{feature.label}</span>
            <Switch
              checked={granted && featureEnabled(feature.key)}
              disabled={!granted || setPrefs.isPending}
              onCheckedChange={(next) => toggleFeature(feature.key, next)}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
