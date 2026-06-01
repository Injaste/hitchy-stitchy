import type { FC } from "react";
import { Clock } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimeRange } from "@/lib/utils/utils-time";

import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useAdminStore } from "../../store/useAdminStore";
import type { Timeline } from "../types";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { getMemberName } from "@/pages/admin/utils/memberUtils";
import NotesMarkdown from "@/components/custom/notes-markdown";
import ArraySeparator from "@/components/custom/array-separator";

interface TimelineCardProps {
  item: Timeline;
}

const TimelineCard: FC<TimelineCardProps> = ({ item }) => {
  const openDetail = useTimelineModalStore((s) => s.openDetail);
  const { memberId } = useAdminStore();
  const { data: members = [] } = useMembersQuery();

  const timeItems = formatTimeRange(item.time_start, item.time_end);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1.5 text-base text-primary">
        <Clock className="size-4 shrink-0" />
        <ArraySeparator items={timeItems} separator="-" className="gap-1" />
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
              {[...item.assignees].sort((a) => (a === memberId ? -1 : 1)).slice(0, 3).map((id) => (
                <Badge key={id} variant={id === memberId ? "default" : "outline"} className="text-xs font-normal">
                  {getMemberName(id, members)}
                </Badge>
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
