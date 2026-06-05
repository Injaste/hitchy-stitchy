import { useMemo } from "react";
import { format } from "date-fns";

import { useAdminStore } from "../../store/useAdminStore";
import { useTimelineModalStore } from "./useTimelineModalStore";
import { generateEventDays } from "../utils";
import type { TimelineGrouped } from "../types";

/**
 * The ordered list of day tabs. Days are revealed *progressively*: from the
 * first event day through the last day that has items, plus one empty day past
 * it (capped at the final event day). So the tabs grow one at a time as you
 * fill them — you never face the whole range of empty days at once. Empty days
 * between filled ones still show (they fall inside the contiguous range), and
 * any item-day left outside the range is unioned in so data is never hidden.
 * The active day is tracked via the create-prefill day in the modal store.
 *
 * Takes the already-fetched timeline `data` so it shares the single query the
 * page root owns, rather than opening a second subscription.
 */
export function useTimelineDays(data: TimelineGrouped | undefined) {
  const { dateStart, dateEnd } = useAdminStore();
  const activeDayId = useTimelineModalStore((s) => s.createPrefill.day);

  const hasItems = (data?.days.length ?? 0) > 0;

  const dayList = useMemo(() => {
    const range =
      dateStart && dateEnd
        ? generateEventDays(dateStart, dateEnd).map((d) =>
            format(d, "yyyy-MM-dd"),
          )
        : [];
    const itemDays = data?.days.map((d) => d.day) ?? [];
    const itemDaySet = new Set(itemDays);

    // Index of the last range-day that has items; reveal up to one empty day
    // past it so tabs appear sequentially rather than all at once.
    let lastFilled = -1;
    range.forEach((day, i) => {
      if (itemDaySet.has(day)) lastFilled = i;
    });
    const cutoff =
      lastFilled === -1 ? 0 : Math.min(lastFilled + 1, range.length - 1);
    const visibleRange = range.slice(0, cutoff + 1);

    // Union with item-days to surface anything left outside the range.
    return Array.from(new Set([...visibleRange, ...itemDays])).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [dateStart, dateEnd, data]);

  const idx = activeDayId ? dayList.indexOf(activeDayId) : 0;
  const activeIndex = Math.max(idx, 0);
  const activeDay = dayList[activeIndex] ?? null;

  return { dayList, activeDay, activeIndex, hasItems };
}
