import { useState, type FC } from "react";
import { AnimatePresence } from "framer-motion";

import { ComponentFade } from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/error-state";

import { useTimelineModalStore } from "../hooks/useTimelineStore";
import TimelineSkeleton from "../states/TimelineSkeleton";
import TimelineEmpty from "../states/TimelineEmpty";

import type { TimelineGroupedDay } from "../types";

import DayTabs from "./DayTabs";
import DayContent from "./DayContent";

interface TimelineViewProps {
  data: TimelineGroupedDay[] | undefined;
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

  const days = data ?? [];
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const activeDay = days.find((d) => d.day === activeDayId) ?? days[0] ?? null;

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
          <TimelineEmpty onAdd={openCreate} />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content">
        <DayTabs
          days={days}
          activeDayId={activeDay?.day ?? ""}
          onSelect={setActiveDayId}
        />
        <AnimatePresence mode="wait">
          {activeDay && (
            <ComponentFade key={activeDay.day}>
              <DayContent day={activeDay} />
            </ComponentFade>
          )}
        </AnimatePresence>
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default TimelineView;
