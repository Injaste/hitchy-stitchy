import type { FC } from "react";
import { Clock, StickyNote } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatTime, calculateTimeDuration } from "@/lib/utils/utils-time";

import { useTimelineModalStore } from "../hooks/useTimelineStore";
import type { TimelineItem } from "../types";

interface TimelineItemCardProps {
  item: TimelineItem;
}

const TimelineItemCard: FC<TimelineItemCardProps> = ({ item }) => {
  const openDetail = useTimelineModalStore((s) => s.openDetail);

  const timeStart = formatTime(item.timeStart);
  const timeEnd = item.timeEnd ? formatTime(item.timeEnd) : null;
  const timeLabel = timeEnd ? `${timeStart} – ${timeEnd}` : timeStart;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-base font-mono text-primary">
        <Clock className="size-4 shrink-0" />
        <span>{timeLabel}</span>
      </div>

      <Card
        className={cn(
          "cursor-pointer hover:bg-muted/40 transition-colors border-l-2 border-secondary",
        )}
        onClick={() => openDetail(item)}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-serif text-secondary leading-snug">
              {item.title}
            </CardTitle>
          </div>

          {item.description && (
            <CardDescription className="mt-1">
              {item.description}
            </CardDescription>
          )}

          {item.notes && (
            <div className="mt-1.5 flex gap-2 items-center bg-secondary/30 p-2 rounded">
              <StickyNote
                strokeWidth={2.5}
                className="size-3 text-muted-foreground/80"
              />
              <span className="text-muted-foreground/80 text-xs">
                {item.notes}
              </span>
            </div>
          )}
        </CardHeader>
      </Card>
    </div>
  );
};

export default TimelineItemCard;
