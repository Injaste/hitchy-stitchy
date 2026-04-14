import type { FC } from "react";
import { Clock } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatTimeRange } from "@/lib/utils/utils-time";

import { useTimelineModalStore } from "../hooks/useTimelineStore";
import type { Timeline } from "../types";
import { Button } from "@/components/ui/button";
import NotesMarkdown from "@/components/custom/notes-markdown";

interface TimelineCardProps {
  item: Timeline;
}

const TimelineCard: FC<TimelineCardProps> = ({ item }) => {
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
              <CardDescription className="line-clamp-3 mt-1 leading-relaxed">
                {item.description}
              </CardDescription>
            )}

            {item.notes && (
              <div className="mt-auto pt-1.5">
                <NotesMarkdown content={item.notes} minified />
              </div>
            )}
          </CardHeader>
        </Card>
      </Button>
    </div>
  );
};

export default TimelineCard;
