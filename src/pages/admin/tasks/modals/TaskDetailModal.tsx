import { format } from "date-fns";
import { StickyNote, Calendar } from "lucide-react";

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
import NotesMarkdown from "@/components/custom/notes-markdown";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { PRIORITY_LABELS, STATUS_LABELS } from "../types";

const TaskDetailModal = () => {
  const isDetailOpen = useTaskModalStore((s) => s.isDetailOpen);
  const selectedItem = useTaskModalStore((s) => s.selectedItem);
  const closeAll = useTaskModalStore((s) => s.closeAll);
  const openEdit = useTaskModalStore((s) => s.openEdit);
  const openDelete = useTaskModalStore((s) => s.openDelete);

  const { canUpdate, canDelete } = useAccess();

  if (!selectedItem) return null;
  const task = selectedItem;

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent className="w-[95vw] max-w-lg" aria-describedby="">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">{STATUS_LABELS[task.status]}</Badge>
            {task.priority && (
              <Badge variant="outline" className="text-muted-foreground">
                {PRIORITY_LABELS[task.priority]}
              </Badge>
            )}
            {task.due_at && (
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <Calendar className="w-3 h-3" />
                Due {format(new Date(task.due_at), "d MMM yyyy")}
              </span>
            )}
          </div>

          <Separator />

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <StickyNote strokeWidth={3} className="w-3 h-3" />
              Details
            </p>
            <NotesMarkdown content={task.details} />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Added {format(new Date(task.created_at), "d MMM yyyy")}
            </p>
            <div className="flex gap-2">
              {canDelete("tasks") && (
                <Button variant="destructive" size="sm" onClick={openDelete}>
                  Delete
                </Button>
              )}
              {canUpdate("tasks") && (
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

export default TaskDetailModal;
