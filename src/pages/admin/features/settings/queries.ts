import { useQuery } from "@/lib/query/useQuery";
import { useMutation } from "@/lib/query/useMutation";
import {
  getSettings,
  saveEventSettings,
  saveRSVPFormConfig,
  saveGuestPool,
} from "./api";
import type { EventSettings, RSVPFormConfig, GuestEntry } from "./types";

export function useSettings() {
  return useQuery(getSettings, { key: "settings" });
}

export function useEventSettingsMutation(options?: { onSuccess?: (data: EventSettings) => void }) {
  return useMutation<EventSettings, EventSettings>(saveEventSettings, {
    toast: {
      loading: "Saving event settings…",
      success: "Event settings saved.",
      error: "Failed to save event settings.",
    },
    onSuccess: options?.onSuccess,
  });
}

export function useRSVPFormMutation(options?: { onSuccess?: (data: RSVPFormConfig) => void }) {
  return useMutation<RSVPFormConfig, RSVPFormConfig>(saveRSVPFormConfig, {
    toast: {
      loading: "Saving RSVP config…",
      success: "RSVP configuration saved.",
      error: "Failed to save RSVP config.",
    },
    onSuccess: options?.onSuccess,
  });
}

export function useGuestPoolMutation(options?: { onSuccess?: (data: GuestEntry[]) => void }) {
  return useMutation<GuestEntry[], GuestEntry[]>(saveGuestPool, {
    toast: {
      loading: "Saving guest pool…",
      success: "Guest pool saved.",
      error: "Failed to save guest pool.",
    },
    onSuccess: options?.onSuccess,
  });
}
