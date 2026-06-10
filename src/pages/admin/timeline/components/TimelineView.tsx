import { useEffect, type FC } from "react";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";

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

import DayTabs from "./DayTabs";
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
  const selectedDate = useTimelineModalStore((s) => s.createPrefill.date);
  const setActiveDate = useTimelineModalStore((s) => s.setActiveDate);
  const { canCreate } = useAccess();

  const { dates, activeDate, activeDay, hasItems } = useTimelineDays(data);

  useEffect(() => {
    // Wait for the query so the day list is final before locking a selection.
    if (!data || !dates.length) return;
    // Seed the active tab when nothing is selected, or the selected day is gone.
    // Prefer today (land on the live day during the event), else the first day.
    if (!selectedDate || !dates.includes(selectedDate)) {
      const today = format(new Date(), "yyyy-MM-dd");
      setActiveDate(dates.includes(today) ? today : (dates[0] ?? null));
    }
  }, [dates, selectedDate, setActiveDate, data]);

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
        <DayTabs
          dates={dates}
          activeDate={activeDate ?? ""}
          onSelect={setActiveDate}
        />
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
