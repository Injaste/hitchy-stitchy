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
import { useRolesQuery } from "@/pages/admin/roles/queries";
import { getRoleName } from "@/pages/admin/utils/assigneeDisplay";
import NotesMarkdown from "@/components/custom/notes-markdown";
import ArraySeparator from "@/components/custom/array-separator";

interface TimelineCardProps {
  item: Timeline;
}

const TimelineCard: FC<TimelineCardProps> = ({ item }) => {
  const openDetail = useTimelineModalStore((s) => s.openDetail);
  const { data: roles = [] } = useRolesQuery();

  const timeItems = formatTimeRange(item.time_start, item.time_end);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1.5 text-base text-primary">
        <Clock className="size-4 shrink-0" />
        <ArraySeparator items={timeItems} separator="-" className="gap-1" />
      </div>

      <Card className="relative mt-2 flex-1 h-full hover:ring-secondary hover:shadow-sm">
        <button
          onClick={() => openDetail(item)}
          aria-label={item.title}
          className="absolute inset-0 rounded-[inherit] z-0 cursor-pointer"
        />
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
            <span className="text-xs text-muted-foreground font-sans pt-1">
              {item.assignees
                .slice(0, 2)
                .map((id) => getRoleName(id, roles))
                .join(", ")}
              {item.assignees.length > 2 && ` +${item.assignees.length - 2}`}
            </span>
          )}
        </CardHeader>
      </Card>
    </div>
  );
};

export default TimelineCard;
