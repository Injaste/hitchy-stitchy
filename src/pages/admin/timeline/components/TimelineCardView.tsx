import type { FC } from "react";
import { Clock, ClockCheck, Lock, Play, Square } from "lucide-react";
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

import type { CardLifecycle } from "../utils";
import type { Timeline } from "../types";
import type { Member } from "../../members/types";
import AssigneeStack from "../../components/AssigneeStack";
import AssigneeAvatars from "../../components/AssigneeAvatars";
import NotesMarkdown from "@/components/custom/notes-markdown";
import ArraySeparator from "@/components/custom/array-separator";
import { cn } from "@/lib/utils";

interface TimelineCardViewProps {
  item: Timeline;
  /** Resolved by the container (null when the viewer can't run the day). */
  lifecycle: CardLifecycle;
  onStart?: () => void;
  onEnd?: () => void;
  onOpen?: () => void;
  startPending?: boolean;
  endPending?: boolean;
  /** True when the plan doesn't include the live-run sub-feature: the start
   *  control reads as gated and onStart opens the upgrade modal instead of
   *  starting. Never set by the marketing showcase (stays unlocked there). */
  liveLocked?: boolean;
  /** When provided (marketing showcase), render these resolved members directly
   *  instead of resolving item.assignees through the members query. */
  assigneeMembers?: Member[];
  selfId?: string | null;
}

/**
 * Pure presentation of a timeline cue — including its live start/end controls.
 * The container (TimelineCard) resolves `lifecycle` from access + the active
 * query and supplies the handlers; the marketing showcase drives `lifecycle`
 * directly to demo running the day live. Single source of truth either way.
 */
const TimelineCardView: FC<TimelineCardViewProps> = ({
  item,
  lifecycle,
  onStart,
  onEnd,
  onOpen,
  startPending,
  endPending,
  liveLocked,
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
                    variant={liveLocked ? "outline" : "success"}
                    size="icon-xs"
                    className="relative z-10"
                    disabled={startPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStart?.();
                    }}
                  >
                    {liveLocked ? (
                      <Lock className="size-3" />
                    ) : (
                      <Play className="size-3 fill-current" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {liveLocked ? "Upgrade to run the day live" : "Start"}
                </TooltipContent>
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

          {assigneeMembers ? (
            <AssigneeAvatars
              members={assigneeMembers}
              selfId={selfId}
              className="pt-1.5"
            />
          ) : (
            item.assignees.length > 0 && (
              <AssigneeStack ids={item.assignees} className="pt-1.5" />
            )
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

export default TimelineCardView;
