import type { FC } from "react";
import { differenceInSeconds } from "date-fns";

import { cn } from "@/lib/utils";
import { formatTime, formatRemainingTime } from "@/lib/utils/utils-time";
import { scheduledStartDate, scheduledEndDate } from "../utils";
import type { Timeline } from "../types";

// A scheduled marker (start/end) overlaid on the actual bar.
const Marker = ({
  left,
  position,
}: {
  left: number;
  position: "start" | "end";
}) => (
  <span
    className={cn(
      "absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-primary aspect-square",
      position === "start" && "-translate-x-0.25",
      position === "end" && "-translate-x-2.5",
    )}
    style={{ left: `${left}%` }}
  />
);

interface PlanActualBarProps {
  item: Timeline;
  now: Date;
  /** Bar only (no heading/caption) — for tight spots like the cue banner. */
  compact?: boolean;
  className?: string;
}

/**
 * One bar = the *actual* run; two dots = the *scheduled* start and end, on a
 * shared min(start)→max(end) scale. A late start offsets the bar from the start
 * dot; an overrun maxes the bar and pushes the end dot back inside it. Shared by
 * the timeline detail view and the active-cue banner.
 */
const PlanActualBar: FC<PlanActualBarProps> = ({
  item,
  now,
  compact,
  className,
}) => {
  const schedEnd = scheduledEndDate(item);
  if (!item.started_at || !schedEnd) return null;

  const schedStart = scheduledStartDate(item);
  const actualStart = new Date(item.started_at);
  const actualEnd = item.ended_at ? new Date(item.ended_at) : now;

  const t0 = Math.min(schedStart.getTime(), actualStart.getTime());
  const t1 = Math.max(schedEnd.getTime(), actualEnd.getTime());
  const span = Math.max(t1 - t0, 1);
  const pct = (ms: number) => ((ms - t0) / span) * 100;

  const actLeft = pct(actualStart.getTime());
  const actWidth = Math.max(pct(actualEnd.getTime()) - actLeft, 1.5);

  // ±5-min grace on both ends (weddings rarely run to the minute). Overrun
  // beyond grace drives the warning; a late start is surfaced in the text only.
  const GRACE_SEC = 5 * 60;
  const startLateSec = differenceInSeconds(actualStart, schedStart);
  const endOverSec = differenceInSeconds(actualEnd, schedEnd);
  const over = endOverSec > GRACE_SEC;
  const under = endOverSec < -GRACE_SEC;
  const lateStart = startLateSec > GRACE_SEC;
  const running = !item.ended_at;

  // Pad by the dot radius so markers sit flush at the true 0 / 100% edges
  // (children are positioned within this padded content box).
  const bar = (
    <div className={cn("relative h-3 px-[5px]", className)}>
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted/50" />
      <div
        className={cn(
          "absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-all duration-1000",
          over ? "bg-warning" : "bg-success",
        )}
        style={{ left: `${actLeft}%`, width: `${actWidth}%` }}
      />
      <Marker left={pct(schedStart.getTime())} position="start" />
      <Marker left={pct(schedEnd.getTime())} position="end" />
    </div>
  );

  if (compact) return bar;

  const statusText = running
    ? over
      ? `Running · ${formatRemainingTime(endOverSec, 2)} over`
      : "Running"
    : over
      ? `${formatRemainingTime(endOverSec, 2)} over`
      : lateStart
        ? `Started ${formatRemainingTime(startLateSec, 2)} late`
        : under
          ? `${formatRemainingTime(-endOverSec, 2)} under`
          : "On time";

  return (
    <div className="space-y-1.5">
      {bar}
      <div className="flex justify-between text-2xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" />
          Planned {formatTime(item.time_start)}–{formatTime(item.time_end!)}
        </span>
        <span className={over || lateStart ? "text-warning" : undefined}>
          {statusText}
        </span>
      </div>
    </div>
  );
};

export default PlanActualBar;
