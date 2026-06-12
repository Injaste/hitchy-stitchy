import { useMemo } from "react";

import { useEventDaysQuery } from "../days/queries";
import { useActiveDay } from "../store/useActiveDay";

/**
 * Resolves the global day selection (`useActiveDay`) against the event's days,
 * so day-bounded features (budget, the shared day rail) never re-derive
 * `days.find(d => d.id === activeDayId)`. The EventDay-level counterpart of the
 * timeline's `useTimelineDays`. Falls back to the first day while the selection
 * seeds / if the stored id isn't in this event yet.
 */
export function useActiveEventDay() {
  const { data } = useEventDaysQuery();
  const { activeDayId, setActiveDay } = useActiveDay();

  const days = useMemo(() => data ?? [], [data]);

  const activeIndex = Math.max(
    0,
    days.findIndex((d) => d.id === activeDayId),
  );
  const activeDay = days[activeIndex] ?? null;

  return {
    days,
    activeDayId,
    activeDay,
    activeIndex,
    multiDay: days.length > 1,
    setActiveDay,
  };
}
