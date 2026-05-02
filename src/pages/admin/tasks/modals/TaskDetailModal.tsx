import { format } from "date-fns";
import { StickyNote, Calendar, CirclePlus, CircleCheck } from "lucide-react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useAccess } from "../../hooks/useAccess";
import NotesMarkdown from "@/components/custom/notes-markdown";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { PRIORITY_LABELS, PRIORITY_BADGE_CLASS, STATUS_LABELS } from "../types";
import TaskStatusIcon from "../components/TaskStatusIcon";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { getMemberName } from "@/pages/admin/utils/assigneeDisplay";

const TaskDetailModal = () => {
  const isDetailOpen = useTaskModalStore((s) => s.isDetailOpen);
  const selectedItem = useTaskModalStore((s) => s.selectedItem);
  const closeAll = useTaskModalStore((s) => s.closeAll);
  const openEdit = useTaskModalStore((s) => s.openEdit);
  const openDelete = useTaskModalStore((s) => s.openDelete);

  const { canUpdate, canDelete } = useAccess();
  const { data: members = [] } = useMembersQuery();

  if (!selectedItem) return null;
  const task = selectedItem;

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>Task details and status.</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex gap-2">
              <TaskStatusIcon status={task.status} />
              {STATUS_LABELS[task.status]}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {task.priority && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium font-sans tracking-wide",
                    PRIORITY_BADGE_CLASS[task.priority],
                  )}
                >
                  {PRIORITY_LABELS[task.priority]}
                </span>
              )}
              {task.due_at && (
                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Calendar className="w-3 h-3" />
                  Due {format(new Date(task.due_at), "d MMM yyyy")}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assigned members
            </p>
            {task.assignees.length === 0 ? (
              <p className="text-sm text-muted-foreground/50 italic">
                No members assigned
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {task.assignees.map((id) => (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    {getMemberName(id, members)}
                  </Badge>
                ))}
              </div>
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
        </DialogBody>

        <DialogFooter className="sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CirclePlus className="w-3 h-3 shrink-0" />
              {format(new Date(task.created_at), "d MMM yyyy")}
            </span>
            {task.completed_at && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CircleCheck className="w-3 h-3 shrink-0" />
                {format(new Date(task.completed_at), "d MMM yyyy")}
              </span>
            )}
          </div>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
