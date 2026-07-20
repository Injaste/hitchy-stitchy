import { create } from "zustand"

import { useActiveEventDay } from "../../hooks/useActiveEventDay"

interface VendorDayFilterState {
  /** Day the vendors list is narrowed to, or null for all days. */
  dayId: string | null
  setDayId: (dayId: string | null) => void
}

/**
 * The vendors list's day filter. A store rather than local state because it's a
 * VIEW SCOPE two places need: the list narrows by it, and "Add expense" from a
 * vendor uses it to guess which day the cost belongs to.
 *
 * Deliberately separate from the global `useActiveDay` (Budget/Timeline's
 * persisted day rail): narrowing a contact directory shouldn't change which day
 * the rest of the app is showing, and vendors can span days anyway.
 */
export const useVendorDayFilter = create<VendorDayFilterState>((set) => ({
  dayId: null,
  setDayId: (dayId) => set({ dayId }),
}))

/**
 * The filter, but only while it still points at a LIVE day. The day it names can
 * be deleted underneath it (days are editable in event settings), and a stale id
 * would otherwise:
 *   • strand the list on an empty result with no chip highlighted — nothing to
 *     click to get out of it except "All days",
 *   • and prefill a dead day into new vendors/expenses, which the server rejects
 *     ("A selected day does not belong to this event").
 * Resolving against live days makes it self-heal back to "all days" instead.
 */
export function useValidVendorDayFilter() {
  const dayId = useVendorDayFilter((s) => s.dayId)
  const { days } = useActiveEventDay()
  return dayId && days.some((d) => d.id === dayId) ? dayId : null
}
