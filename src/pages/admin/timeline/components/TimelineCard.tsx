import type { FC } from "react";
import { Clock } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
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
            <CardTitle className="text-secondary leading-snug">
              {item.title}
            </CardTitle>

            {item.description && (
              <CardDescription className="pt-1.5 h-full w-full text-accent">
                <NotesMarkdown content={item.description} minified />
              </CardDescription>
            )}
          </CardHeader>
        </Card>
      </Button>
    </div>
  );
};

export default TimelineCard;
