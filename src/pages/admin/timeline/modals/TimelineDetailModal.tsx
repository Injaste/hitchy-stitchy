import { useMemo } from "react";
import { format } from "date-fns";
import { Clock, Users } from "lucide-react";
import { parseLocalDate, formatTimeRange } from "@/lib/utils/utils-time";
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

  const item = useMemo(
    () =>
      data?.days
        .flatMap((d) => d.labelGroups.flatMap((g) => g.items))
        .find((i) => i.id === selectedItem?.id) ?? selectedItem,
    [data, selectedItem],
  );

  if (!item) return null;

  const dateLabel = format(parseLocalDate(item.day), "d MMMM yyyy");
  const timeLabel = formatTimeRange(item.time_start, item.time_end);

  const isActive = active?.id === item.id;
  const otherActive = active && active.id !== item.id ? active : null;
  const showLifecycle = canUpdate("timeline");
  const startLabel = item.started_at ? "Restart" : "Start";

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

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3 shrink-0" />
                  Status
                  {isActive && (
                    <Badge variant="default" className="text-2xs font-normal">
                      Live
                    </Badge>
                  )}
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-4">
                    <span>Started</span>
                    <span className={item.started_at ? undefined : "text-muted-foreground/50"}>
                      {item.started_at ? format(new Date(item.started_at), "h:mm a") : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Ended</span>
                    <span className={item.ended_at ? undefined : "text-muted-foreground/50"}>
                      {item.ended_at ? format(new Date(item.ended_at), "h:mm a") : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {showLifecycle && (
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex gap-2">
                    {isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => endItem(item)}
                        disabled={end.isPending}
                      >
                        End
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={isActive ? "secondary" : "default"}
                      onClick={() => startItem(item)}
                      disabled={start.isPending}
                    >
                      {startLabel}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {otherActive && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary flex items-center gap-1.5">
                  <Clock className="w-3 h-3 shrink-0" />
                  Currently live
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-foreground">{otherActive.title}</span>
                    <span>{otherActive.started_at && format(new Date(otherActive.started_at), "h:mm a")}</span>
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
