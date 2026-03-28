export const PING_PRESETS = [
  "👋 Heads up!",
  "⏰ It's time",
  "✅ You're up next",
  "🚨 Need you now",
] as const;

export type PingPreset = (typeof PING_PRESETS)[number];
