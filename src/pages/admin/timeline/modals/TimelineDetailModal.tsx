import { format } from "date-fns";
import { parseLocalDate, formatTimeRange } from "@/lib/utils/utils-time";
import { StickyNote } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineStore";
import NotesMarkdown from "@/components/custom/notes-markdown";

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
      <DialogContent className="w-[95vw] max-w-lg" aria-describedby="">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-1">
          {/* Time, date & label */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{timeLabel}</span>
            <span>·</span>
            <span>{dateLabel}</span>
            {item.label && (
              <>
                <span>·</span>
                <Badge variant="outline">{item.label}</Badge>
              </>
            )}
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <StickyNote strokeWidth={3} className="w-3 h-3" />
              Details
            </p>
            <NotesMarkdown content={item.details} />
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
          <div className="flex items-center justify-end gap-4">
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
