import type { FC } from "react";
import { Plus } from "lucide-react";
import { differenceInDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import {
  ActionLabel,
  type BaseHeaderProps,
} from "@/components/custom/page-header-base";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
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
  const openCreateWithLabel = useTimelineModalStore(
    (s) => s.openCreateWithLabel,
  );
  const { dateStart, dateEnd } = useAdminStore();

  const dayCount =
    dateStart && dateEnd
      ? differenceInDays(new Date(dateEnd), new Date(dateStart)) + 1
      : null;

  const itemCount =
    data?.days.reduce(
      (sum, day) =>
        sum + day.labelGroups.reduce((s, g) => s + g.items.length, 0),
      0,
    ) ?? 0;

  return (
    <AdminPageHeader
      title="Timeline"
      description="Track and manage scheduled events across your selected date range."
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      meta={
        dateStart &&
        dateEnd && (
          <span className="flex flex-col">
            <ArraySeparator
              items={formatDateRange(dateStart, dateEnd)}
              separator="-"
              className="gap-1 whitespace-nowrap"
            />
            <ArraySeparator
              items={[
                dayCount && `${dayCount} ${dayCount === 1 ? "day" : "days"}`,
                itemCount > 0 &&
                  `${itemCount} ${itemCount === 1 ? "item" : "items"}`,
              ]}
            />
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
