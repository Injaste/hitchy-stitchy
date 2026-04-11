import type { FC } from "react";
import { Clock, StickyNote, ChevronRight } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatTime, calculateTimeDuration } from "@/lib/utils/utils-time";

import { useTimelineModalStore } from "../hooks/useTimelineStore";
import type { TimelineItem } from "../types";

interface TimelineItemCardProps {
  item: TimelineItem;
  roleMap: Record<string, string>;
}

const TimelineItemCard: FC<TimelineItemCardProps> = ({ item }) => {
  const openDetail = useTimelineModalStore((s) => s.openDetail);

  const timeStart = formatTime(item.timeStart);
  const timeEnd = item.timeEnd ? formatTime(item.timeEnd) : null;
  const timeLabel = timeEnd ? `${timeStart} – ${timeEnd}` : timeStart;
  const duration = item.timeEnd
    ? calculateTimeDuration(item.timeStart, item.timeEnd)
    : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-base font-mono text-primary">
        <Clock className="size-4 shrink-0" />
        <span>{timeLabel}</span>
        {duration && (
          <span className="ml-1 text-xs font-sans tabular-nums text-muted-foreground">
            {duration}
          </span>
        )}
      </div>

      <Card
        className={cn(
          "cursor-pointer hover:bg-muted/40 transition-colors",
          item.notes && "border-l-2 border-primary/30",
        )}
        onClick={() => openDetail(item)}
      >
        <CardHeader className="px-5 py-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-serif text-secondary leading-snug">
              {item.title}
            </CardTitle>
            <ChevronRight className="size-4 shrink-0 mt-0.5 text-muted-foreground/50" />
          </div>

          {item.label && (
            <Badge variant="outline" className="self-start w-fit mt-1">
              {item.label}
            </Badge>
          )}

          {item.description && (
            <CardDescription className="mt-1">
              {item.description}
            </CardDescription>
          )}

          {item.notes && (
            <div className="mt-1.5">
              <StickyNote className="size-3 text-muted-foreground/60" />
            </div>
          )}
        </CardHeader>
      </Card>
    </div>
  );
};

export default TimelineItemCard;
