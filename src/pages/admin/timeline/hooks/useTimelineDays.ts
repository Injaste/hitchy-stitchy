import { useMemo } from "react";

import { useTimelineModalStore } from "./useTimelineModalStore";
import { dayHasItems } from "../utils";
import type { TimelineGrouped } from "../types";

/**
 * Resolves the day tabs (from event_days) and the active selection. Returns both
 * the active date string (`activeDate`) and the active day object (`activeDay`)
 * so callers never re-derive `days.find(d => d.date === …)`. `hasItems` reports
 * whether any timeline item exists at all — used to pick the empty state.
 */
export function useTimelineDays(data: TimelineGrouped | undefined) {
  const selectedDate = useTimelineModalStore((s) => s.createPrefill.date);

  const days = useMemo(() => data?.days ?? [], [data]);
  const dates = useMemo(() => days.map((d) => d.date), [days]);
  const hasItems = useMemo(() => days.some(dayHasItems), [days]);

  const idx = selectedDate ? dates.indexOf(selectedDate) : -1;
  const activeIndex = idx >= 0 ? idx : 0;
  const activeDate = dates[activeIndex] ?? null;
  const activeDay = days[activeIndex] ?? null;

  return { dates, activeDate, activeDay, activeIndex, hasItems };
}
