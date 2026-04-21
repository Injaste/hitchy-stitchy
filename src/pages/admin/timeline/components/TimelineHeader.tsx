import type { FC } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { differenceInDays } from "date-fns";

import { Button } from "@/components/ui/button";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineStore";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import { AnimatePresence } from "framer-motion";
import { useRefetch } from "../../hooks/useRefetch";
import { useAdminStore } from "../../store/useAdminStore";
import { formatDateRange } from "@/lib/utils/utils-time";
import type { TimelineGroupedDay } from "../types";

interface TimelineHeaderProps {
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
  data?: TimelineGroupedDay[];
}

const TimelineHeader: FC<TimelineHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
  data,
}) => {
  const { handleRefresh, canRefresh } = useRefetch(refetch);
  const { canCreate } = useAccess();
  const openCreate = useTimelineModalStore((s) => s.openCreate);
  const { dateStart, dateEnd } = useAdminStore();

  const showActions = !isLoading && !isError;

  const dayCount =
    dateStart && dateEnd
      ? differenceInDays(new Date(dateEnd), new Date(dateStart)) + 1
      : null;

  const itemCount = data?.reduce(
    (sum, day) => sum + day.labelGroups.reduce((s, g) => s + g.items.length, 0),
    0,
  );

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm tracking-wide text-muted-foreground">
        {dateStart && dateEnd && (
          <span className="flex flex-col">
            <span className="whitespace-nowrap">
              {formatDateRange(dateStart, dateEnd)}
            </span>

            <span className="flex items-center">
              {dayCount !== null && (
                <span className="whitespace-nowrap">
                  {dayCount} {dayCount === 1 ? "day" : "days"}
                </span>
              )}

              {itemCount !== undefined && itemCount > 0 && (
                <span className="whitespace-nowrap">
                  <span className="mx-1.5">·</span>
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              )}
            </span>
          </span>
        )}
      </p>
      <AnimatePresence mode="wait">
        {showActions && (
          <ComponentFade key={showActions.toString()}>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={handleRefresh}
                disabled={!canRefresh}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
                />
              </Button>
              {canCreate("timeline") && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={openCreate}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Timeline
                </Button>
              )}
            </div>
          </ComponentFade>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelineHeader;
