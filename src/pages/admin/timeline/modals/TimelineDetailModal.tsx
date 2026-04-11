import { format } from "date-fns";
import { StickyNote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [y, m, d] = item.day.split("-").map(Number);
  const dateLabel = format(new Date(y, m - 1, d), "d MMMM yyyy");
  const timeLabel = item.timeEnd
    ? `${item.timeStart} – ${item.timeEnd}`
    : item.timeStart;

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent className="w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{timeLabel}</span>
            <span>·</span>
            <span>{dateLabel}</span>
            {item.label && <Badge variant="secondary">{item.label}</Badge>}
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          )}

          {item.notes && (
            <div className="text-sm bg-primary/5 p-3 rounded-md text-primary border border-primary/10 flex gap-2 items-start">
              <StickyNote className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{item.notes}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
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
      </DialogContent>
    </Dialog>
  );
};

export default TimelineDetailModal;
