import type { FC } from "react";
import { Plus } from "lucide-react";
import { differenceInDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import {
  ActionLabel,
  type BaseHeaderProps,
} from "@/components/custom/page-header-base";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineDays } from "../hooks/useTimelineDays";
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
  const openCreateWithLabel = useTimelineModalStore(
    (s) => s.openCreateWithLabel,
  );
  const { dateStart, dateEnd } = useAdminStore();
  const { activeIndex, activeDay, hasItems } = useTimelineDays(data);

  const dayCount =
    dateStart && dateEnd
      ? differenceInDays(new Date(dateEnd), new Date(dateStart)) + 1
      : null;

  const activeDayLabel = hasItems ? `Day ${activeIndex + 1}` : null;
  const activeDayDate =
    hasItems && activeDay ? format(parseLocalDate(activeDay), "MMM d") : null;

  return (
    <AdminPageHeader
      title="Timeline"
      titleSuffix={
        activeDayLabel && (
          <ArraySeparator
            items={[activeDayLabel, activeDayDate].filter(Boolean)}
            separator={<span className="text-muted-foreground/50">·</span>}
            className="text-sm sm:text-base font-medium text-muted-foreground"
          />
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
            onClick={() => openCreateWithLabel(null)}
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
