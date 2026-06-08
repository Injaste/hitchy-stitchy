import { useMemo } from "react";
import { format } from "date-fns";

import { useAdminStore } from "../../store/useAdminStore";
import { useTimelineModalStore } from "./useTimelineModalStore";
import { generateEventDays } from "../utils";
import type { TimelineGrouped } from "../types";

/**
 * The ordered list of day tabs: every day in the event range (start → end),
 * unioned with any item-day that falls outside the range so data is never
 * hidden. All days show at once. The active day is tracked via the
 * create-prefill day in the modal store.
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

    // Show the full event range, unioned with any item-days outside it.
    return Array.from(new Set([...range, ...itemDays])).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [dateStart, dateEnd, data]);

  const idx = activeDayId ? dayList.indexOf(activeDayId) : 0;
  const activeIndex = Math.max(idx, 0);
  const activeDay = dayList[activeIndex] ?? null;

  return { dayList, activeDay, activeIndex, hasItems };
}
