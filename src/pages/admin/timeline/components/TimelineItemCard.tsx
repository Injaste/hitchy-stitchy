import type { FC } from "react";
import { Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatTime } from "@/lib/utils/utils-time";

import { useTimelineModalStore } from "../hooks/useTimelineStore";
import type { TimelineItem } from "../types";

interface TimelineItemCardProps {
  item: TimelineItem;
  roleMap: Record<string, string>;
}

const TimelineItemCard: FC<TimelineItemCardProps> = ({ item, roleMap }) => {
  const openDetail = useTimelineModalStore((s) => s.openDetail);

  const timeStart = formatTime(item.timeStart);
  const timeEnd = item.timeEnd && formatTime(item.timeEnd);

  const timeLabel = timeEnd ? `${timeStart} – ${timeEnd}` : timeStart;

  const assigneeLabels = item.assignees
    .map((id) => roleMap[id])
    .filter(Boolean);

  return (
    <div className="space-y-2">
      <span className="flex items-center text-base font-mono text-primary">
        <Clock className="size-4 mr-1" />
        {timeLabel}
      </span>

      <Card
        className="cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={() => openDetail(item)}
      >
        <CardHeader>
          <CardTitle className="text-secondary">{item.title}</CardTitle>

          {item.description && (
            <CardDescription>{item.description}</CardDescription>
          )}
        </CardHeader>
        {/* <CardContent className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {assigneeLabels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {assigneeLabels.map((label) => (
                  <span
                    key={label}
                    className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent> */}
      </Card>
    </div>
  );
};

export default TimelineItemCard;
