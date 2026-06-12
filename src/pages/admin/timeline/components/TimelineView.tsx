import { useEffect, type FC } from "react";
import { AnimatePresence } from "framer-motion";

import ComponentFade from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/states/error-state";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineDays } from "../hooks/useTimelineDays";
import { defaultSegmentId, dayHasItems } from "../utils";
import TimelineSkeleton from "../states/TimelineSkeleton";
import TimelineEmpty from "../states/TimelineEmpty";
import TimelineDayEmpty from "../states/TimelineDayEmpty";

import type { TimelineGrouped } from "../types";

import DayTabs from "../../components/DayTabs";
import TimelineDay from "./TimelineDay";

interface TimelineViewProps {
  data: TimelineGrouped | undefined;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const TimelineView: FC<TimelineViewProps> = ({
  data,
  isLoading,
  isError,
  refetch,
  isRefetching,
}) => {
  const openCreate = useTimelineModalStore((s) => s.openCreate);
  const setActiveDate = useTimelineModalStore((s) => s.setActiveDate);
  const { canCreate } = useAccess();

  const { activeDate, activeDay, hasItems } = useTimelineDays(data);

  // The active day is owned globally by useActiveDay now; keep the create-item
  // prefill pointed at the day in view so a new item lands on it.
  useEffect(() => {
    setActiveDate(activeDate);
  }, [activeDate, setActiveDate]);

  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton" useBlur>
          <TimelineSkeleton />
        </ComponentFade>
      );

    if (isError)
      return (
        <ComponentFade key="error" useBlur>
          <ErrorState
            message="We couldn't load your timeline. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );

    if (!hasItems)
      return (
        <ComponentFade key="empty" useBlur>
          <TimelineEmpty
            onAdd={() => openCreate(defaultSegmentId(data?.days[0]))}
            canCreate={canCreate("timeline")}
          />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content" useBlur>
        <DayTabs />
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeDay && dayHasItems(activeDay) ? (
              <ComponentFade key={activeDay.date} useBlur>
                <TimelineDay day={activeDay} />
              </ComponentFade>
            ) : (
              activeDate && (
                <ComponentFade key={`empty-${activeDate}`} useBlur>
                  <TimelineDayEmpty
                    day={activeDate}
                    canCreate={canCreate("timeline")}
                    onAdd={() => openCreate(defaultSegmentId(activeDay))}
                  />
                </ComponentFade>
              )
            )}
          </AnimatePresence>
        </div>
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default TimelineView;
