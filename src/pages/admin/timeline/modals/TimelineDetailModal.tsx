import { format } from "date-fns";
import { parseLocalDate, formatTimeRange } from "@/lib/utils/utils-time";
import { StickyNote } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineStore";

const TimelineDetailModal = () => {
  const isDetailOpen = useTimelineModalStore((s) => s.isDetailOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const openEdit = useTimelineModalStore((s) => s.openEdit);
  const openDelete = useTimelineModalStore((s) => s.openDelete);

  const { canUpdate, canDelete } = useAccess();

  if (!selectedItem) return null;

  const item = selectedItem;
  const dateLabel = format(parseLocalDate(item.day), "d MMMM yyyy");
  const timeLabel = formatTimeRange(item.time_start, item.time_end);

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent className="w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle >{item.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-1">
          {/* Time, date & label */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{timeLabel}</span>
            <span>·</span>
            <span>{dateLabel}</span>
            {item.label && <Badge variant="outline">{item.label}</Badge>}
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <StickyNote className="w-3 h-3" />
              Notes
            </p>
            {item.notes ? (
              <div className="text-sm bg-primary/5 p-3 rounded-md text-primary border border-primary/10 leading-relaxed">
                {item.notes}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">
                No notes added
              </p>
            )}
          </div>

          {/* Assignees */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assignees
            </p>
            {item.assignees.length === 0 ? (
              <p className="text-sm text-muted-foreground/50 italic">
                No assignees
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {item.assignees.length} assigned
              </p>
            )}
          </div>

          <Separator />

          {/* Footer — createdAt + actions */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Added {format(new Date(item.created_at), "d MMM yyyy")}
            </p>
            <div className="flex gap-2">
              {canDelete("timeline") && (
                <Button variant="destructive" size="sm" onClick={openDelete}>
                  Delete
                </Button>
              )}
              {canUpdate("timeline") && (
                <Button size="sm" onClick={openEdit} autoFocus>
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimelineDetailModal;
