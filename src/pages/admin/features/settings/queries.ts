import { useMutation } from "@/lib/query/useMutation";
import { getGuestPool, saveGuestPool } from "./api";
import type { GuestEntry } from "./types";

/** Stub — returns an object with guestPool for GuestPoolSection compatibility */
export function useSettings() {
  return {
    data: { guestPool: [] as GuestEntry[] },
    isLoading: false,
  };
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
