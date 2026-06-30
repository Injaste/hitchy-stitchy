import { type FC } from "react";
import { Circle, CircleCheck, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import type { Timeline, TimelineLabelGroup } from "../types";
import { useAccess } from "../../hooks/useAccess";
import { useTimelineCreateGuard } from "../hooks/useTimelineCreateGuard";
import { useActiveTimelineQuery } from "../queries";
import LabelCarousel from "./LabelCarousel";

interface SegmentLabelProps {
  group: TimelineLabelGroup;
  segmentId: string;
  isNotLastItem: boolean;
  dayItems: Timeline[];
}

/** One label group on the vertical rail: status node + label + its carousel. */
const SegmentLabel: FC<SegmentLabelProps> = ({
  group,
  segmentId,
  isNotLastItem,
  dayItems,
}) => {
  const { canCreate } = useAccess();
  const openCreate = useTimelineCreateGuard();
  const { data: active } = useActiveTimelineQuery();

  const isActive = group.items.some((i) => i.id === active?.id);
  const isDone = !isActive && group.items.every((i) => i.started_at !== null);

  // Prefill the next item's start with the last item's end (or start) time.
  const lastItem = group.items[group.items.length - 1];
  const suggestedTime = lastItem.time_end ?? lastItem.time_start;

  return (
    <div
      className={cn(
        "group/timeline-segment relative flex gap-4",
        isNotLastItem && "pb-10",
      )}
    >
      <div className="absolute top-0 bottom-0 left-[9px] border border-foreground/50 rounded-full">
        {!isNotLastItem && (
          <div className="absolute -bottom-0.5 -translate-x-0.5 w-1 h-8 bg-linear-to-t from-background from-10% to-transparent" />
        )}
      </div>

      {isActive ? (
        <div className="relative size-5 shrink-0 z-1 flex items-center justify-center bg-background">
          <span className="animate-ping absolute h-3 w-3 rounded-full bg-primary/50" />
          <span className="relative h-3 w-3 rounded-full bg-primary" />
        </div>
      ) : isDone ? (
        <CircleCheck className="size-5 text-muted-foreground bg-background z-1 shrink-0" />
      ) : (
        <Circle className="size-5 text-primary/70 bg-background z-1 shrink-0" />
      )}

      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 ml-1 -mt-[3px]">
          {group.label && (
            <p className="text-sm">
              <span
                className={cn(
                  "font-semibold transition-colors duration-500",
                  isActive && "text-primary",
                  isDone && "text-muted-foreground",
                  !isActive && !isDone && "text-foreground",
                )}
              >
                {group.label}
              </span>
            </p>
          )}
          {canCreate("timeline") && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="hidden transition-opacity md:inline-flex md:opacity-0 md:group-hover/timeline-segment:opacity-50 md:hover:opacity-100"
              onClick={() =>
                openCreate(
                  segmentId,
                  group.label,
                  suggestedTime,
                  group.label ? `Add to ${group.label}` : null,
                )
              }
              aria-label={group.label ? `Add item to ${group.label}` : "Add item"}
            >
              <Plus className="size-4" />
            </Button>
          )}
        </div>

        <LabelCarousel items={group.items} dayItems={dayItems} />
      </div>
    </div>
  );
};

export default SegmentLabel;
