import { useEffect, type FC } from "react";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";

import ComponentFade from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/states/error-state";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineDays } from "../hooks/useTimelineDays";
import TimelineSkeleton from "../states/TimelineSkeleton";
import TimelineEmpty from "../states/TimelineEmpty";
import TimelineDayEmpty from "../states/TimelineDayEmpty";

import type { TimelineGrouped } from "../types";

import DayTabs from "./DayTabs";
import TimelineSection from "./TimelineSection";

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
  const openCreateWithLabel = useTimelineModalStore(
    (s) => s.openCreateWithLabel,
  );
  const activeDayId = useTimelineModalStore((s) => s.createPrefill.day);
  const setActiveDayId = useTimelineModalStore((s) => s.setPrefillDay);
  const { canCreate } = useAccess();

  const { dayList, activeDay, hasItems } = useTimelineDays(data);
  const activeGroup = data?.days.find((d) => d.day === activeDay) ?? null;

  useEffect(() => {
    // Wait for the query so the day list is final before locking a selection.
    if (!data || !dayList.length) return;
    // Seed the active tab when nothing is selected, or the selected day is gone.
    // Prefer today (land on the live day during the event), else the first day
    // with items.
    if (!activeDayId || !dayList.includes(activeDayId)) {
      const today = format(new Date(), "yyyy-MM-dd");
      const seed = dayList.includes(today)
        ? today
        : (data.days[0]?.day ?? dayList[0]);
      setActiveDayId(seed);
    }
  }, [dayList, activeDayId, setActiveDayId, data]);

  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton">
          <TimelineSkeleton />
        </ComponentFade>
      );

    if (isError)
      return (
        <ComponentFade key="error">
          <ErrorState
            message="We couldn't load your timeline. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );

    if (!hasItems)
      return (
        <ComponentFade key="empty">
          <TimelineEmpty
            onAdd={() => openCreateWithLabel(null)}
            canCreate={canCreate("timeline")}
          />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content">
        <DayTabs
          days={dayList}
          activeDayId={activeDay ?? ""}
          onSelect={setActiveDayId}
        />
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeGroup ? (
              <ComponentFade key={activeGroup.day}>
                <TimelineSection day={activeGroup} />
              </ComponentFade>
            ) : (
              activeDay && (
                <ComponentFade key={`empty-${activeDay}`}>
                  <TimelineDayEmpty
                    day={activeDay}
                    canCreate={canCreate("timeline")}
                    onAdd={() => openCreateWithLabel(null)}
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
