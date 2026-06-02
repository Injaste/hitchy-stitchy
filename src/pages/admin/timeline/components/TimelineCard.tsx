import type { FC } from "react";
import { Clock } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTimeRange } from "@/lib/utils/utils-time";
import { useNow } from "@/hooks/use-now";

import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineLifecycleActions } from "../hooks/useTimelineLifecycleActions";
import { useActiveTimelineQuery } from "../queries";
import { getCardLifecycle } from "../utils";
import { useAccess } from "../../hooks/useAccess";
import { useAdminStore } from "../../store/useAdminStore";
import type { Timeline } from "../types";
import MemberBadge from "@/pages/admin/members/components/MemberBadge";
import NotesMarkdown from "@/components/custom/notes-markdown";
import ArraySeparator from "@/components/custom/array-separator";

interface TimelineCardProps {
  item: Timeline;
  dayItems: Timeline[];
}

const TimelineCard: FC<TimelineCardProps> = ({ item, dayItems }) => {
  const openDetail = useTimelineModalStore((s) => s.openDetail);
  const { memberId } = useAdminStore();
  const { canUpdate } = useAccess();
  const { data: active } = useActiveTimelineQuery();
  const { startItem, endItem, start, end } = useTimelineLifecycleActions();
  const now = useNow();

  const timeItems = formatTimeRange(item.time_start, item.time_end);

  const lifecycle = canUpdate("timeline")
    ? getCardLifecycle(item, dayItems, active?.id ?? null, now)
    : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 text-base text-primary">
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock className="size-4 shrink-0" />
          <ArraySeparator items={timeItems} separator="-" className="gap-1" />
        </div>

        {lifecycle === "start" && (
          <Button
            size="xs"
            variant="success"
            className="relative z-10 shrink-0"
            disabled={start.isPending}
            onClick={(e) => {
              e.stopPropagation();
              startItem(item);
            }}
          >
            Start
          </Button>
        )}
        {lifecycle === "end" && (
          <Button
            size="xs"
            variant="warning"
            className="relative z-10 shrink-0"
            disabled={end.isPending}
            onClick={(e) => {
              e.stopPropagation();
              endItem(item);
            }}
          >
            End
          </Button>
        )}
      </div>

      <Card variant="interactive" className="relative mt-2 flex-1 h-full">
        <button
          onClick={() => openDetail(item)}
          aria-label={item.title}
          className="absolute inset-0 rounded-[inherit] z-0 cursor-pointer"
        />
        <CardHeader className="flex-1 flex flex-col">
          <CardTitle className="text-secondary leading-snug">
            {item.title}
          </CardTitle>

          {item.assignees.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1.5">
              {[...item.assignees]
                .sort((a) => (a === memberId ? -1 : 1))
                .slice(0, 3)
                .map((id) => (
                  <MemberBadge
                    key={id}
                    memberId={id}
                    variant={id === memberId ? "default" : "outline"}
                  />
                ))}
              {item.assignees.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{item.assignees.length - 3}
                </Badge>
              )}
            </div>
          )}

          {item.details && (
            <CardDescription className="pt-1.5 h-full w-full text-accent">
              <NotesMarkdown content={item.details} size="sm" />
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </div>
  );
};

export default TimelineCard;
