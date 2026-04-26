import type { FC } from "react";
import { Clock, Users } from "lucide-react";

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
import ArraySeparator from "@/components/custom/array-separator";

interface TimelineCardProps {
  item: Timeline;
}

const TimelineCard: FC<TimelineCardProps> = ({ item }) => {
  const openDetail = useTimelineModalStore((s) => s.openDetail);

  const timeItems = formatTimeRange(item.time_start, item.time_end);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1.5 text-base text-primary">
        <Clock className="size-4 shrink-0" />
        <ArraySeparator items={timeItems} separator="-" className="gap-1" />
      </div>

      <Button variant="card" size="free" className="mt-2 flex-1">
        <Card className="h-full" onClick={() => openDetail(item)}>
          <CardHeader className="flex-1 flex flex-col">
            <CardTitle className="text-secondary leading-snug">
              {item.title}
            </CardTitle>

            {item.details && (
              <CardDescription className="pt-1.5 h-full w-full text-accent">
                <NotesMarkdown content={item.details} size="sm" />
              </CardDescription>
            )}

            {item.assignees.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans pt-1">
                <Users className="size-3 shrink-0" />
                {item.assignees.length}
              </span>
            )}
          </CardHeader>
        </Card>
      </Button>
    </div>
  );
};

export default TimelineCard;
