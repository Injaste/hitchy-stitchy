import type { FC } from "react";
import { Dot, Plus } from "lucide-react";
import { differenceInDays } from "date-fns";

import { Button } from "@/components/ui/button";

import {
  PageHeader,
  type BaseHeaderProps,
} from "@/components/custom/page-header";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineStore";
import { useAdminStore } from "../../store/useAdminStore";
import { formatDateRange } from "@/lib/utils/utils-time";
import type { TimelineGroupedDay } from "../types";

interface TimelineHeaderProps extends BaseHeaderProps {
  data?: TimelineGroupedDay[];
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

  const dayCount =
    dateStart && dateEnd
      ? differenceInDays(new Date(dateEnd), new Date(dateStart)) + 1
      : null;

  const itemCount = data?.reduce(
    (sum, day) => sum + day.labelGroups.reduce((s, g) => s + g.items.length, 0),
    0,
  );

  return (
    <PageHeader
      description="Track and manage scheduled events across your selected date range."
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      meta={
        dateStart &&
        dateEnd && (
          <span className="flex flex-col">
            <span className="whitespace-nowrap">
              {formatDateRange(dateStart, dateEnd)}
            </span>
            <span className="flex items-center">
              {dayCount !== null && (
                <span>
                  {dayCount} {dayCount === 1 ? "day" : "days"}
                </span>
              )}
              {itemCount !== undefined && itemCount > 0 && (
                <span className="flex items-center">
                  <Dot />
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              )}
            </span>
          </span>
        )
      }
      action={
        canCreate("timeline") && (
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Add Timeline
          </Button>
        )
      }
    />
  );
};

export default TimelineHeader;
