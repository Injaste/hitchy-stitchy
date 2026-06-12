import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format } from "date-fns";

import { useAdminStore } from "./useAdminStore";
import { useEventDaysQuery } from "../days/queries";

interface ActiveDayState {
  /** The event the stored selection belongs to — a mismatch means "unseeded",
   *  so switching events re-seeds rather than carrying a stale day over. */
  eventId: string | null;
  /** Selected event_days id, or null for the "All days" overview. */
  dayId: string | null;
  select: (eventId: string, dayId: string | null) => void;
}

// Persisted to localStorage so the day you were planning survives a reload.
const useActiveDayStore = create<ActiveDayState>()(
  persist(
    (set) => ({
      eventId: null,
      dayId: null,
      select: (eventId, dayId) => set({ eventId, dayId }),
    }),
    { name: "hs-active-day" },
  ),
);

/**
 * Global "which event day am I looking at" — shared across day-scoped admin
 * features (timeline, budget) so the selection persists as you move between
 * them. `activeDayId` is an `event_days` id, or `null` for the "All days"
 * overview. Seeds to today (when it's an event day) else day 1 the first time an
 * event is opened, then sticks to the user's choice. The live-day "jump to now"
 * is intentionally not automatic — a persisted selection shouldn't be yanked.
 */
export function useActiveDay() {
  const eventId = useAdminStore((s) => s.eventId);
  const { data: days } = useEventDaysQuery();
  const storedEventId = useActiveDayStore((s) => s.eventId);
  const storedDayId = useActiveDayStore((s) => s.dayId);
  const select = useActiveDayStore((s) => s.select);

  const seeded = storedEventId === eventId;
  const storedValid =
    seeded &&
    (storedDayId === null || (days?.some((d) => d.id === storedDayId) ?? false));

  const seedId = useMemo(() => {
    if (!days?.length) return null;
    const today = format(new Date(), "yyyy-MM-dd");
    return days.find((d) => d.date === today)?.id ?? days[0].id;
  }, [days]);

  // Derive synchronously (no first-paint flash); persist the seed in an effect.
  const activeDayId = storedValid ? storedDayId : seedId;

  useEffect(() => {
    if (!eventId || storedValid || !seedId) return;
    select(eventId, seedId);
  }, [eventId, storedValid, seedId, select]);

  const setActiveDay = (dayId: string | null) => {
    if (eventId) select(eventId, dayId);
  };

  return { activeDayId, setActiveDay };
}
