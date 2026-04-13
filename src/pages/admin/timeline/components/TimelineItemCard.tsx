import type { FC } from "react";
import { Clock, StickyNote } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatTimeRange } from "@/lib/utils/utils-time";

import { useTimelineModalStore } from "../hooks/useTimelineStore";
import type { TimelineItem } from "../types";
import { Button } from "@/components/ui/button";

interface TimelineItemCardProps {
  item: TimelineItem;
}

const TimelineItemCard: FC<TimelineItemCardProps> = ({ item }) => {
  const openDetail = useTimelineModalStore((s) => s.openDetail);

  const timeLabel = formatTimeRange(item.time_start, item.time_end);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1.5 text-base text-primary">
        <Clock className="size-4 shrink-0" />
        <span>{timeLabel}</span>
      </div>

      <Button variant="card" size="free" className="mt-2 flex-1">
        <Card className="h-full" onClick={() => openDetail(item)}>
          <CardHeader className="flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-secondary leading-snug">
                {item.title}
              </CardTitle>
            </div>

            {item.description && (
              <CardDescription className="line-clamp-3 mt-1">
                {item.description}
              </CardDescription>
            )}

            {item.notes && (
              <div
                className={`flex gap-2 items-center bg-secondary/30 p-2 rounded ${item.description ? "mt-auto pt-1.5" : "mt-2"}`}
              >
                <StickyNote
                  strokeWidth={2.5}
                  className="size-3 text-muted-foreground/80"
                />
                <span className="line-clamp-1 text-muted-foreground/80 text-xs whitespace-pre-line">
                  {item.notes}
                </span>
              </div>
            )}
          </CardHeader>
        </Card>
      </Button>
    </div>
  );
};

export default TimelineItemCard;
