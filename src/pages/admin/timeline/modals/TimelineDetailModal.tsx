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
import { useRolesQuery } from "@/pages/admin/roles/queries";
import { getRoleName } from "@/pages/admin/utils/assigneeDisplay";

const TimelineDetailModal = () => {
  const isDetailOpen = useTimelineModalStore((s) => s.isDetailOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const openEdit = useTimelineModalStore((s) => s.openEdit);
  const openDelete = useTimelineModalStore((s) => s.openDelete);

  const { canUpdate, canDelete } = useAccess();
  const { data: roles = [] } = useRolesQuery();

  if (!selectedItem) return null;

  const item = selectedItem;
  const dateLabel = format(parseLocalDate(item.day), "d MMMM yyyy");
  const timeLabel = formatTimeRange(item.time_start, item.time_end);

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent className="w-[95vw] max-w-lg" aria-describedby="">
        <DialogHeader className="flex flex-row items-center gap-2">
          <DialogTitle>{item.title}</DialogTitle>
          {item.label && (
            <>
              <span>·</span>
              <Badge variant="outline">{item.label}</Badge>
            </>
          )}
        </DialogHeader>

        <div className="space-y-6 mt-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{timeLabel}</span>
            <span>·</span>
            <span>{dateLabel}</span>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <StickyNote strokeWidth={3} className="w-3 h-3" />
              Details
            </p>
            <NotesMarkdown content={item.details} />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assignees
            </p>
            {item.assignees.length === 0 ? (
              <p className="text-sm text-muted-foreground/50 italic">No assignees</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {item.assignees.map((id) => (
                  <Badge key={id} variant="secondary" className="text-xs font-normal">
                    {getRoleName(id, roles)}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

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
