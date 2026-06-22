import { createSettingsStore } from "@/lib/createSettingsStore";

// Account-global settings overlay — reused on the dashboard (account menu) and
// inside admin (sidebar). Open with useAccountSettingsStore.getState().open().
export const useAccountSettingsStore = createSettingsStore();
