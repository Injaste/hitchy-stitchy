import { createSettingsStore } from "@/lib/createSettingsStore";

// Event-scoped settings overlay (admin only): dates, your per-event display
// name, notification prefs. Open with useEventSettingsStore.getState().open().
export const useEventSettingsStore = createSettingsStore();
