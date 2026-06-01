import { format, parseISO } from "date-fns";
import { Calendar, Clock, History, Users } from "lucide-react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDetailActions,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useAccess } from "../../hooks/useAccess";
import NotesMarkdown from "@/components/custom/notes-markdown";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { PRIORITY_LABELS, PRIORITY_BADGE_CLASS, STATUS_LABELS } from "../types";
import TaskStatusIcon from "../components/TaskStatusIcon";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { getMemberName } from "@/pages/admin/utils/memberUtils";

const TaskDetailModal = () => {
  const isDetailOpen = useTaskModalStore((s) => s.isDetailOpen);
  const selectedItem = useTaskModalStore((s) => s.selectedItem);
  const closeAll = useTaskModalStore((s) => s.closeAll);
  const openEdit = useTaskModalStore((s) => s.openEdit);
  const openDelete = useTaskModalStore((s) => s.openDelete);
  const openArchive = useTaskModalStore((s) => s.openArchive);

  const { canUpdate, canDelete } = useAccess();
  const { data: members = [] } = useMembersQuery();

  if (!selectedItem) return null;
  const task = selectedItem;

  const formatDate = "d MMM yyyy";
  const formatTime = "HH:mm";

  const historyItems = [
    {
      label: "Created",
      date: format(parseISO(task.created_at), formatDate),
      time: format(parseISO(task.created_at), formatTime),
    },
    task.completed_at && {
      label: "Completed",
      date: format(parseISO(task.completed_at), formatDate),
      time: format(parseISO(task.completed_at), formatTime),
    },
  ].filter(Boolean) as { label: string; date: string; time: string }[];

  const destructiveActions = [
    canDelete("tasks") && { label: "Delete", onClick: openDelete },
    canDelete("tasks") && {
      label: "Archive",
      onClick: () => openArchive([task]),
    },
  ];
  const primaryAction = canUpdate("tasks") && {
    label: "Edit",
    onClick: openEdit,
  };

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex gap-2 items-center justify-between">
                <span className="flex gap-2 items-center justify-between">
                  <TaskStatusIcon status={task.status} />
                  {STATUS_LABELS[task.status]}
                </span>
                {task.due_at && (
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="w-3 h-3" />
                    Due {format(new Date(task.due_at), "d MMM yyyy")}
                  </span>
                )}
              </div>
              <div className="text-sm">
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
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3 h-3 shrink-0" />
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

            <NotesMarkdown content={task.details} />

            <Separator />

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <History className="w-3 h-3 shrink-0" />
                History
              </p>
              <div className="space-y-1">
                {historyItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-xs text-muted-foreground"
                  >
                    <span>{item.label}</span>
                    <span className="flex gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {item.time}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogBody>

        <Separator />

        <DialogDetailActions
          destructive={destructiveActions}
          primary={primaryAction}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
