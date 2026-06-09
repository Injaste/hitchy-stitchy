import { useMemo } from "react";
import { format, differenceInSeconds } from "date-fns";
import {
  Circle,
  CircleCheck,
  Clock,
  Play,
  RotateCcw,
  Square,
  Users,
} from "lucide-react";
import {
  parseLocalDate,
  formatTimeRange,
  formatRemainingTime,
} from "@/lib/utils/utils-time";
import ArraySeparator from "@/components/custom/array-separator";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDetailActions,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useAccess } from "../../hooks/useAccess";
import { useAdminStore } from "../../store/useAdminStore";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineLifecycleActions } from "../hooks/useTimelineLifecycleActions";
import { useTimelineQuery, useActiveTimelineQuery } from "../queries";
import NotesMarkdown from "@/components/custom/notes-markdown";
import MemberBadge from "@/pages/admin/members/components/MemberBadge";
import { useNow } from "@/hooks/use-now";
import { cn } from "@/lib/utils";
import { flattenTimeline, scheduledStartDate } from "../utils";
import PlanActualBar from "../components/PlanActualBar";

const TimelineDetailModal = () => {
  const isDetailOpen = useTimelineModalStore((s) => s.isDetailOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const openEdit = useTimelineModalStore((s) => s.openEdit);
  const openDelete = useTimelineModalStore((s) => s.openDelete);

  const { canUpdate, canDelete } = useAccess();
  const { memberId } = useAdminStore();
  const { data } = useTimelineQuery();
  const { data: active } = useActiveTimelineQuery();
  const { startItem, endItem, start, end } = useTimelineLifecycleActions();
  // Single modal instance — tick every second while open; don't run at all
  // when closed (and refresh on open so it's correct immediately).
  const now = useNow(isDetailOpen ? 1_000 : null);

  const item = useMemo(
    () =>
      (data ? flattenTimeline(data) : []).find(
        (i) => i.id === selectedItem?.id,
      ) ?? selectedItem,
    [data, selectedItem],
  );

  if (!item) return null;

  const dateLabel = format(parseLocalDate(item.day), "d MMMM yyyy");
  const timeLabel = formatTimeRange(item.time_start, item.time_end);

  const isActive = active?.id === item.id;
  const done = !!item.started_at && !isActive;
  const otherActive = active && active.id !== item.id ? active : null;
  const showLifecycle = canUpdate("timeline");
  const startLabel = item.started_at ? "Restart" : "Start";

  // Relative timing: countdown before start, elapsed while live, run when done.
  const timing = (() => {
    if (item.started_at && item.ended_at) {
      const secs = differenceInSeconds(
        new Date(item.ended_at),
        new Date(item.started_at),
      );
      return { label: "Ran for", value: formatRemainingTime(secs, 2) };
    }
    if (isActive && item.started_at) {
      const secs = differenceInSeconds(now, new Date(item.started_at));
      return { label: "Running for", value: formatRemainingTime(secs, 2) };
    }
    if (!item.started_at) {
      const secs = differenceInSeconds(scheduledStartDate(item), now);
      return secs > 0
        ? { label: "Starts in", value: formatRemainingTime(secs, 2) }
        : { label: "Overdue by", value: formatRemainingTime(-secs, 2) };
    }
    return null;
  })();

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {item.title}
            {item.label && (
              <Badge variant="secondary" className="text-2xs font-normal">
                {item.label}
              </Badge>
            )}
          </DialogTitle>

          {/* Scheduled date + time */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>{dateLabel}</span>
            <span className="text-muted-foreground/40">·</span>
            <ArraySeparator items={timeLabel} separator="-" className="gap-1" />
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            {item.assignees.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3 h-3 shrink-0" />
                  Assignees
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[...item.assignees]
                    .sort((a) => (a === memberId ? -1 : 1))
                    .map((id) => (
                      <MemberBadge
                        key={id}
                        memberId={id}
                        variant={id === memberId ? "default" : "outline"}
                      />
                    ))}
                </div>
              </div>
            )}

            <NotesMarkdown content={item.details} />

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {isActive ? (
                    <span className="relative flex size-5 shrink-0 items-center justify-center">
                      <span className="absolute size-4 animate-ping rounded-full bg-primary/50" />
                      <span className="size-4 rounded-full bg-primary" />
                    </span>
                  ) : done ? (
                    <CircleCheck className="size-5 shrink-0 text-muted-foreground" />
                  ) : (
                    <Circle className="size-5 shrink-0 text-primary/70" />
                  )}
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        "text-sm font-medium leading-none",
                        isActive
                          ? "text-primary"
                          : done
                            ? "text-muted-foreground"
                            : "text-foreground",
                      )}
                    >
                      {isActive ? "Live" : done ? "Done" : "Upcoming"}
                    </p>
                    {timing && (
                      <p className="text-xs text-muted-foreground">
                        {timing.label}{" "}
                        <span className="font-medium text-foreground">
                          {timing.value}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {showLifecycle && (
                  <div className="flex shrink-0 gap-2">
                    {isActive && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => endItem(item)}
                        disabled={end.isPending}
                      >
                        <Square className="size-3.5 fill-current" />
                        End
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => startItem(item)}
                      disabled={start.isPending}
                    >
                      {item.started_at ? (
                        <RotateCcw className="size-3.5" />
                      ) : (
                        <Play className="size-3.5 fill-current" />
                      )}
                      {startLabel}
                    </Button>
                  </div>
                )}
              </div>

              <PlanActualBar item={item} now={now} />
            </div>

            {otherActive && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary flex items-center gap-1.5">
                  <Clock className="w-3 h-3 shrink-0" />
                  Currently live
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-foreground">
                      {otherActive.title}
                    </span>
                    <span>
                      {otherActive.started_at &&
                        format(new Date(otherActive.started_at), "h:mm a")}
                    </span>
                  </div>
                  {showLifecycle && (
                    <p className="text-muted-foreground/70">
                      Starting this item will end it.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogBody>

        <Separator />

        <DialogDetailActions
          destructive={[
            canDelete("timeline") && { label: "Delete", onClick: openDelete },
          ]}
          primary={
            canUpdate("timeline") && { label: "Edit", onClick: openEdit }
          }
        />
      </DialogContent>
    </Dialog>
  );
};

export default TimelineDetailModal;
