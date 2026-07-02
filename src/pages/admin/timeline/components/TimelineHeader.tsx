import type { FC } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import {
  ActionLabel,
  type BaseHeaderProps,
} from "@/components/custom/page-header-base";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineCreateGuard } from "../hooks/useTimelineCreateGuard";
import { useTimelineDays } from "../hooks/useTimelineDays";
import { dayItems, defaultSegmentId, getLatestTime } from "../utils";
import { dayLabel } from "../../days/utils";
import { useAdminStore } from "../../store/useAdminStore";
import { formatDateRange } from "@/lib/utils/utils-time";
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
  const openCreate = useTimelineCreateGuard();
  const { dateStart, dateEnd } = useAdminStore();
  const { dates, activeIndex, activeDay, hasItems } = useTimelineDays(data);

  // Count the actual event_days, not the dateStart→dateEnd span — days can be
  // non-consecutive, so the span would over-count (e.g. Jun 28 + Jun 30 = 2 days,
  // not 3).
  const dayCount = dates.length || null;

  const activeDayLabel = hasItems
    ? dayLabel(activeDay?.label, activeIndex)
    : null;

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
          <div className="flex min-w-0 items-center text-sm font-medium text-muted-foreground sm:text-base">
            <span className="min-w-0 truncate">{activeDayLabel}</span>
          </div>
        )
      }
      description="Plan out each day, moment by moment."
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
            data-tour-action
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
