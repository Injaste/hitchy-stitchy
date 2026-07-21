import { create } from "zustand"

import { useActiveEventDay } from "../../hooks/useActiveEventDay"

interface VendorDayScopeState {
  /** The "All days" override: show every vendor regardless of day. */
  showAll: boolean
  setShowAll: (showAll: boolean) => void
}

/**
 * The vendors directory's day scope has two parts, deliberately split:
 *
 *   • the SELECTED DAY is the shared global day (`useActiveDay`) — picking a day
 *     here shows on Budget/Timeline too, and vice versa. Symmetric with every
 *     other day-scoped page.
 *   • "All days" is a vendors-ONLY override held here. It shows the whole roster
 *     (the only place a 0-day vendor — e.g. flowers — is reachable) and never
 *     touches the global day, so the other routes keep their concrete day.
 *
 * The override is per-visit: VendorsView clears it on unmount, so each fresh
 * visit starts on the active day (the default) rather than a stale "All".
 */
export const useVendorDayScope = create<VendorDayScopeState>((set) => ({
  showAll: false,
  setShowAll: (showAll) => set({ showAll }),
}))

/**
 * The effective day the directory is filtered to: the shared global day, unless
 * the local "All days" override is on (then null = the whole roster). Read by the
 * list, the day-tile highlight, and the "Add expense / Add vendor" day guesses,
 * so they all agree on one answer.
 */
export function useVendorFilterDay(): string | null {
  const { activeDayId } = useActiveEventDay()
  const showAll = useVendorDayScope((s) => s.showAll)
  return showAll ? null : activeDayId
}
