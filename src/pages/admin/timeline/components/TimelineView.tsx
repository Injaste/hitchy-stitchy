import { useEffect, useState, type FC } from "react";
import { AnimatePresence } from "framer-motion";

import { ComponentFade } from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/error-state";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import TimelineSkeleton from "../states/TimelineSkeleton";
import TimelineEmpty from "../states/TimelineEmpty";

import type { TimelineGrouped } from "../types";

import DayTabs from "./DayTabs";
import DayContent from "./DayContent";

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
  const { canCreate } = useAccess();

  const days = data?.days ?? [];
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const activeDayIndex = activeDayId
    ? days.findIndex((d) => d.day === activeDayId)
    : 0;
  const activeDay = days[activeDayIndex] ?? days[0] ?? null;

  useEffect(() => {
    if (activeDayId && !days.some((d) => d.day === activeDayId)) {
      setActiveDayId(days[0]?.day ?? null);
    }
  }, [days, activeDayId]);

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

    if (!days.length)
      return (
        <ComponentFade key="empty">
          <TimelineEmpty onAdd={openCreate} canCreate={canCreate("timeline")} />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content">
        <DayTabs
          days={days}
          activeDayId={activeDay?.day ?? ""}
          onSelect={setActiveDayId}
        />
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeDay && (
              <ComponentFade key={activeDay.day}>
                <DayContent day={activeDay} dayIndex={activeDayIndex} />
              </ComponentFade>
            )}
          </AnimatePresence>
        </div>
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default TimelineView;
