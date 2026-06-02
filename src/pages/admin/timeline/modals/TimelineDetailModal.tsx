import { useState } from "react";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { parseLocalDate, formatTimeRange } from "@/lib/utils/utils-time";
import ArraySeparator from "@/components/custom/array-separator";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useAccess } from "../../hooks/useAccess";
import { useAdminStore } from "../../store/useAdminStore";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineLifecycleMutations, useActiveTimelineQuery } from "../queries";
import NotesMarkdown from "@/components/custom/notes-markdown";
import MemberBadge from "@/pages/admin/members/components/MemberBadge";

const TimelineDetailModal = () => {
  const isDetailOpen = useTimelineModalStore((s) => s.isDetailOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const openEdit = useTimelineModalStore((s) => s.openEdit);
  const openDelete = useTimelineModalStore((s) => s.openDelete);

  const { canUpdate, canDelete } = useAccess();
  const { memberId, eventId } = useAdminStore();
  const { data: active } = useActiveTimelineQuery();
  const { start, end } = useTimelineLifecycleMutations();

  const [restartOpen, setRestartOpen] = useState(false);

  if (!selectedItem) return null;

  const item = selectedItem;
  const dateLabel = format(parseLocalDate(item.day), "d MMMM yyyy");
  const timeLabel = formatTimeRange(item.time_start, item.time_end);

  // Is this specific item currently live?
  const isActive = active?.id === item.id;
  // Is a *different* item currently live (will be auto-ended on Start)?
  const otherActive = active && active.id !== item.id ? active : null;

  const handleStart = () => {
    if (item.started_at !== null) {
      // Previously started — show restart confirm before overwriting history
      setRestartOpen(true);
    } else {
      start.mutate({ event_id: eventId!, id: item.id });
    }
  };

  const handleEnd = () => {
    end.mutate({ event_id: eventId!, id: item.id });
  };

  const handleConfirmRestart = () => {
    start.mutate({ event_id: eventId!, id: item.id });
    setRestartOpen(false);
  };

  const showLifecycle = canUpdate("timeline");

  return (
    <>
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

            {/* Actual start / end times — only when the item has been run */}
            {item.started_at && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Started {format(new Date(item.started_at), "h:mm a")}</span>
                {item.ended_at ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>Ended {format(new Date(item.ended_at), "h:mm a")}</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden>·</span>
                    <span className="text-primary font-medium">Live</span>
                  </>
                )}
              </div>
            )}
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
            </div>
          </DialogBody>

          <Separator />

          <DialogFooter className="sm:justify-between">
            {/* Left: destructive */}
            <div>
              {canDelete("timeline") && (
                <Button variant="destructive" size="sm" onClick={openDelete}>
                  Delete
                </Button>
              )}
            </div>

            {/* Right: lifecycle + edit */}
            <div className="flex flex-col items-end gap-2">
              {/* Inline note when a fresh start will auto-end another live item */}
              {showLifecycle && !item.started_at && otherActive && (
                <p className="text-xs text-muted-foreground">
                  "{otherActive.title}" is live · will auto-end
                </p>
              )}

              <div className="flex gap-2">
                {showLifecycle && isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEnd}
                    disabled={end.isPending}
                  >
                    End
                  </Button>
                )}

                {showLifecycle && (
                  <Button
                    size="sm"
                    variant={isActive ? "secondary" : "default"}
                    onClick={handleStart}
                    disabled={start.isPending}
                  >
                    {item.started_at ? "Restart" : "Start"}
                  </Button>
                )}

                {canUpdate("timeline") && (
                  <Button size="sm" variant="outline" onClick={openEdit}>
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restart confirm — only mounts when needed so state resets between items */}
      <AlertDialog open={restartOpen} onOpenChange={setRestartOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Restart "{item.title}"?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1.5 text-left">
                <p>
                  This will reset the start time to now. Previous run: started{" "}
                  {format(new Date(item.started_at!), "h:mm a")}
                  {item.ended_at
                    ? `, ended ${format(new Date(item.ended_at), "h:mm a")}`
                    : " (still active)"}
                  .
                </p>
                {otherActive && (
                  <p>
                    "{otherActive.title}" is currently live and will be
                    auto-ended.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestart}>
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TimelineDetailModal;
