import type { FC } from "react";

import { useAdaptiveNow } from "@/hooks/use-now";

import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineLifecycleActions } from "../hooks/useTimelineLifecycleActions";
import { useActiveTimelineQuery } from "../queries";
import {
  getCardLifecycle,
  scheduledStartDate,
  scheduledEndDate,
} from "../utils";
import { useAccess } from "../../hooks/useAccess";
import type { Timeline } from "../types";
import TimelineCardView from "./TimelineCardView";

interface TimelineCardProps {
  item: Timeline;
  dayItems: Timeline[];
}

/**
 * Timeline cue container — resolves the live lifecycle from access + the active
 * cue, runs the adaptive countdown clock, and wires start/end/detail, then
 * renders the pure TimelineCardView. The view is shared with the marketing
 * showcase so the cue (and its live controls) never fork.
 */
const TimelineCard: FC<TimelineCardProps> = ({ item, dayItems }) => {
  const openDetail = useTimelineModalStore((s) => s.openDetail);
  const { canUpdate } = useAccess();
  const { data: active } = useActiveTimelineQuery();
  const { startItem, endItem, start, end } = useTimelineLifecycleActions();

  // Count toward the item's next meaningful moment (its end while live, else
  // its start); the clock only ticks per-second when that moment is near.
  const isRunning = !!item.started_at && !item.ended_at;
  const targetDate = isRunning
    ? scheduledEndDate(item)
    : scheduledStartDate(item);
  const now = useAdaptiveNow(targetDate ? targetDate.getTime() : null);

  const lifecycle = canUpdate("timeline")
    ? getCardLifecycle(item, dayItems, active?.id ?? null, now)
    : null;

  return (
    <TimelineCardView
      item={item}
      lifecycle={lifecycle}
      onStart={() => startItem(item)}
      onEnd={() => endItem(item)}
      onOpen={() => openDetail(item)}
      startPending={start.isPending}
      endPending={end.isPending}
    />
  );
};

export default TimelineCard;
