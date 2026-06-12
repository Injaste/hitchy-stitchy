import { useMemo } from "react";

import { useActiveDay } from "../../store/useActiveDay";
import { dayHasItems } from "../utils";
import type { TimelineGrouped } from "../types";

/**
 * Resolves the timeline's active day from the global day selection
 * (`useActiveDay`). Returns the active date and the grouped day object so
 * callers never re-derive `days.find(d => d.day_id === …)`, plus `hasItems` —
 * whether any timeline item exists at all — for the empty-state choice.
 */
export function useTimelineDays(data: TimelineGrouped | undefined) {
  const { activeDayId } = useActiveDay();

  const days = useMemo(() => data?.days ?? [], [data]);
  const dates = useMemo(() => days.map((d) => d.date), [days]);
  const hasItems = useMemo(() => days.some(dayHasItems), [days]);

  // Fall back to the first day while the global selection seeds / if the stored
  // day isn't in this event's list yet.
  const activeIndex = Math.max(
    0,
    days.findIndex((d) => d.day_id === activeDayId),
  );
  const activeDay = days[activeIndex] ?? null;
  const activeDate = activeDay?.date ?? null;

  return { dates, activeDate, activeDay, activeIndex, hasItems };
}
