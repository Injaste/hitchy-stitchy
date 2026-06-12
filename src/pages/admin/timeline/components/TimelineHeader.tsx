import type { FC } from "react";
import { Plus } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import {
  ActionLabel,
  type BaseHeaderProps,
} from "@/components/custom/page-header-base";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineDays } from "../hooks/useTimelineDays";
import { dayItems, defaultSegmentId, getLatestTime } from "../utils";
import { dayLabel } from "../../days/utils";
import { useAdminStore } from "../../store/useAdminStore";
import { formatDateRange, parseLocalDate } from "@/lib/utils/utils-time";
import type { TimelineGrouped } from "../types";
import ArraySeparator from "@/components/custom/array-separator";

interface TimelineHeaderProps extends BaseHeaderProps {
  data?: TimelineGrouped;
}

const TimelineHeader: FC<TimelineHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
  data,
}) => {
  const { canCreate } = useAccess();
  const openCreate = useTimelineModalStore((s) => s.openCreate);
  const { dateStart, dateEnd } = useAdminStore();
  const { dates, activeIndex, activeDate, activeDay, hasItems } =
    useTimelineDays(data);

  // Count the actual event_days, not the dateStart→dateEnd span — days can be
  // non-consecutive, so the span would over-count (e.g. Jun 28 + Jun 30 = 2 days,
  // not 3).
  const dayCount = dates.length || null;

  const activeDayLabel = hasItems
    ? dayLabel(activeDay?.label, activeIndex)
    : null;
  const activeDayDate =
    hasItems && activeDate ? format(parseLocalDate(activeDate), "MMM d") : null;

  // The header create opens at the end of the day in view: prefill the next
  // item's start with that day's latest time and target its default segment.
  const suggestedStart =
    (activeDay ? getLatestTime(dayItems(activeDay)) : "") || null;
  const targetSegmentId = defaultSegmentId(activeDay);

  return (
    <AdminPageHeader
      title="Timeline"
      titleSuffix={
        activeDayLabel && (
          <div className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground sm:text-base">
            {/* Label is the only item allowed to shrink — it truncates so a long
                day name can't push the date or wrap it across lines. */}
            <span className="min-w-0 truncate">{activeDayLabel}</span>
            {activeDayDate && (
              <>
                <span className="shrink-0 text-muted-foreground/50">·</span>
                <span className="shrink-0 whitespace-nowrap">
                  {activeDayDate}
                </span>
              </>
            )}
          </div>
        )
      }
      description="Track and manage scheduled events across your selected date range."
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      meta={
        dateStart &&
        dateEnd && (
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <ArraySeparator
              items={formatDateRange(dateStart, dateEnd)}
              separator="-"
              className="gap-1"
            />
            {dayCount && (
              <span className="text-muted-foreground/70">({dayCount}d)</span>
            )}
          </span>
        )
      }
      action={
        canCreate("timeline") && (
          <Button
            size="sm"
            onClick={() => openCreate(targetSegmentId, null, suggestedStart)}
            className="gap-0"
          >
            <Plus className="w-4 h-4" /> <ActionLabel>Timeline</ActionLabel>
          </Button>
        )
      }
    />
  );
};

export default TimelineHeader;
