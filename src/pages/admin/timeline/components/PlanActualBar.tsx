import type { FC } from "react";
import { differenceInMinutes } from "date-fns";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/utils-time";
import { scheduledStartDate, scheduledEndDate } from "../utils";
import type { Timeline } from "../types";

// A scheduled marker (start/end) overlaid on the actual bar.
const Marker = ({ left }: { left: number }) => (
  <span
    className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
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
  // Inset the scale so edge points (and their dots) don't clip at 0 / 100%.
  const pct = (ms: number) => 5 + ((ms - t0) / span) * 90;

  const actLeft = pct(actualStart.getTime());
  const actWidth = Math.max(pct(actualEnd.getTime()) - actLeft, 1.5);

  const overMin = differenceInMinutes(actualEnd, schedEnd);
  const over = overMin > 0;
  const running = !item.ended_at;

  const bar = (
    <div className={cn("relative h-3", className)}>
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted/50" />
      <div
        className={cn(
          "absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full",
          over ? "bg-warning" : "bg-success",
        )}
        style={{ left: `${actLeft}%`, width: `${actWidth}%` }}
      />
      <Marker left={pct(schedStart.getTime())} />
      <Marker left={pct(schedEnd.getTime())} />
    </div>
  );

  if (compact) return bar;

  const statusText = running
    ? over
      ? `Running · ${overMin}m over`
      : "Running"
    : over
      ? `${overMin}m over`
      : overMin < 0
        ? `${-overMin}m under`
        : "On time";

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Plan vs actual
      </p>
      {bar}
      <div className="flex justify-between text-2xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" />
          Planned {formatTime(item.time_start)}–{formatTime(item.time_end!)}
        </span>
        <span className={over ? "text-warning" : undefined}>{statusText}</span>
      </div>
    </div>
  );
};

export default PlanActualBar;
