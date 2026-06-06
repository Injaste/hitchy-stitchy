/** A member's notification feature flags, e.g. `{ timeline: false }`. Default-on
 *  by absence: a key that isn't present (or isn't `false`) means enabled. */
export type NotificationPrefs = Record<string, boolean>

export type PushSubscriptionStatus = "subscribed" | "unsubscribed" | "unsupported"

/**
 * The notification categories shown as toggles. Only "timeline" exists today;
 * adding a future feature (tasks, guests, …) is one entry here plus a matching
 * `preferences.notifications.<key> !== false` check in that feature's push
 * edge function — no schema change. Keys must match what edge functions read.
 */
export const NOTIFICATION_FEATURES = [
  { key: "timeline", label: "Timeline updates" },
] as const
