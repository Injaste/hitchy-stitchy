import type { FC } from "react";
import { Clock, ClockCheck, Play, Square } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { calculateTimeDuration, formatTimeRange } from "@/lib/utils/utils-time";
import ArraySeparator from "@/components/custom/array-separator";
import NotesMarkdown from "@/components/custom/notes-markdown";
import AssigneeAvatars from "@/pages/admin/components/AssigneeAvatars";
import { cn } from "@/lib/utils";

import type { CardLifecycle } from "@/pages/admin/timeline/utils";
import type { Timeline } from "@/pages/admin/timeline/types";
import type { Member } from "@/pages/admin/members/types";

interface TimelineCardProps {
  item: Timeline;
  lifecycle: CardLifecycle;
  onStart?: () => void;
  onEnd?: () => void;
  onOpen?: () => void;
  startPending?: boolean;
  endPending?: boolean;
  assigneeMembers?: Member[];
  selfId?: string | null;
}

/** Stripped timeline card — no admin data wiring; assignees always passed directly. */
const TimelineCard: FC<TimelineCardProps> = ({
  item,
  lifecycle,
  onStart,
  onEnd,
  onOpen,
  startPending,
  endPending,
  assigneeMembers,
  selfId,
}) => {
  const timeItems = formatTimeRange(item.time_start, item.time_end);
  const duration = item.time_end
    ? calculateTimeDuration(item.time_start, item.time_end, "short")
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
                className="text-sm gap-1 text-primary"
              />,
              duration,
            ]}
            className="text-2xs gap-1 text-muted-foreground"
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
                    disabled={startPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStart?.();
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
                    disabled={endPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnd?.();
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
        className={cn(
          "relative mt-2 flex-1 h-full overflow-hidden shadow-sm transition-all",
          lifecycle === "end" && "ring-2 ring-primary",
        )}
      >
        <button
          onClick={onOpen}
          aria-label={item.title}
          className="absolute inset-0 rounded-[inherit] z-0 cursor-pointer"
        />
        <CardHeader className="flex-1 flex flex-col">
          <CardTitle className="text-secondary leading-snug">
            {item.title}
          </CardTitle>

          {assigneeMembers && assigneeMembers.length > 0 && (
            <AssigneeAvatars
              members={assigneeMembers}
              selfId={selfId}
              className="pt-1.5"
            />
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
