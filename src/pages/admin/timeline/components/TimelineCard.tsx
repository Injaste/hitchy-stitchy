import type { FC } from "react";
import { Clock, ClockCheck, Play, Square } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { calculateTimeDuration, formatTimeRange } from "@/lib/utils/utils-time";
import { useNow } from "@/hooks/use-now";

import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineLifecycleActions } from "../hooks/useTimelineLifecycleActions";
import { useActiveTimelineQuery } from "../queries";
import { getCardLifecycle, scheduledEndDate } from "../utils";
import { useAccess } from "../../hooks/useAccess";
import { useAdminStore } from "../../store/useAdminStore";
import type { Timeline } from "../types";
import MemberBadge from "@/pages/admin/members/components/MemberBadge";
import NotesMarkdown from "@/components/custom/notes-markdown";
import ArraySeparator from "@/components/custom/array-separator";
import { cn } from "@/lib/utils";

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
  const duration = () =>
    item.time_end ? (
      <span className="text-2xs">
        {calculateTimeDuration(item.time_start, item.time_end, "short")}
      </span>
    ) : null;

  const lifecycle = canUpdate("timeline")
    ? getCardLifecycle(item, dayItems, active?.id ?? null, now)
    : null;

  return (
    <div
      className={cn(
        "flex flex-col h-full transition-opacity duration-500",
        lifecycle === "done" && "opacity-50",
      )}
    >
      <div className="flex items-center justify-between gap-2 text-base text-primary">
        <div className="flex items-center gap-1.5 min-w-0">
          {lifecycle === "done" ? (
            <ClockCheck className="size-4 shrink-0" />
          ) : (
            <Clock className="size-4 shrink-0" />
          )}
          <ArraySeparator
            items={[
              <ArraySeparator
                items={timeItems}
                separator="-"
                className="gap-1 text-primary"
              />,
              duration(),
            ]}
            separator="·"
            className="gap-1 text-muted-foreground"
          />
        </div>

        <AnimatePresence mode="wait">
          {lifecycle === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.15 } }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.1 } }}
              className="shrink-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="success"
                    size="icon-xs"
                    className="relative z-10"
                    disabled={start.isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      startItem(item);
                    }}
                  >
                    <Play className="size-3 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Start</TooltipContent>
              </Tooltip>
            </motion.div>
          )}
          {lifecycle === "end" && (
            <motion.div
              key="end"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.15 } }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.1 } }}
              className="shrink-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-xs"
                    variant="warning"
                    className="relative z-10"
                    disabled={end.isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      endItem(item);
                    }}
                  >
                    <Square className="size-3 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>End</TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Card
        variant="interactive"
        className="relative mt-2 flex-1 h-full overflow-hidden"
      >
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

        {lifecycle === "end" &&
          item.started_at &&
          (() => {
            const end = scheduledEndDate(item);
            if (!end) return null;
            const pct = Math.min(
              100,
              Math.max(
                0,
                ((now.getTime() - new Date(item.started_at).getTime()) /
                  (end.getTime() - new Date(item.started_at).getTime())) *
                  100,
              ),
            );
            return (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/15">
                <div
                  className="h-full bg-primary/50 transition-all duration-30000 ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
            );
          })()}
      </Card>
    </div>
  );
};

export default TimelineCard;
