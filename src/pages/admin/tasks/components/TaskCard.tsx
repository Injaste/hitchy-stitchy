import type { FC } from "react";
import { Calendar, GripVertical, Users } from "lucide-react";
import { format, startOfToday, isBefore } from "date-fns";

import { cn } from "@/lib/utils";
import { parseLocalDate } from "@/lib/utils/utils-time";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import NotesMarkdown from "@/components/custom/notes-markdown";

import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTaskMutations } from "../queries";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { getMemberName } from "@/pages/admin/utils/assigneeDisplay";
import {
  PRIORITY_LABELS,
  PRIORITY_BADGE_CLASS,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "../types";
import { Button } from "@/components/ui/button";
import TaskStatusIcon from "./TaskStatusIcon";

interface TaskCardProps {
  task: Task;
  dragHandleListeners?: Record<string, unknown>;
  dragHandleAttributes?: Record<string, unknown>;
}

const priorityBar: Record<TaskPriority, string> = {
  high: "bg-destructive/70",
  medium: "bg-warning/60",
  low: "bg-foreground/30",
};

const statusCard: Record<TaskStatus, string> = {
  todo: "",
  in_progress: "ring-primary/30",
  done: "opacity-60",
};

const TaskCard: FC<TaskCardProps> = ({
  task,
  dragHandleListeners,
  dragHandleAttributes,
}) => {
  const openDetail = useTaskModalStore((s) => s.openDetail);
  const { update } = useTaskMutations();
  const { data: members = [] } = useMembersQuery();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next: TaskStatus = task.status === "done" ? "todo" : "done";
    update.mutate({ ...task, status: next });
  };

  const isDone = task.status === "done";
  const isOverdue =
    !isDone &&
    !!task.due_at &&
    isBefore(parseLocalDate(task.due_at), startOfToday());

  return (
    <Card
      className={cn(
        "relative group hover:ring-secondary hover:shadow-sm",
        statusCard[task.status],
        isOverdue && "ring-1 ring-destructive/30",
      )}
    >
      <button
        onClick={() => openDetail(task)}
        aria-label={task.title}
        className="absolute inset-0 rounded-[inherit] z-0 cursor-pointer"
      />

      {isOverdue && (
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-destructive animate-pulse" />
      )}

      <div
        className={cn(
          "absolute left-0 inset-y-2 w-1 rounded-full",
          task.priority ? priorityBar[task.priority] : "bg-border",
        )}
      />

      {dragHandleListeners && (
        <Button
          {...(dragHandleListeners as React.HTMLAttributes<HTMLButtonElement>)}
          {...(dragHandleAttributes as React.HTMLAttributes<HTMLButtonElement>)}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-1 right-1 opacity-40 lg:opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing touch-none"
          variant="ghost"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
      )}

      <CardHeader className="pl-6 pr-8">
        <div className="flex items-start gap-3">
          <Button
            onClick={handleToggle}
            className="relative shrink-0 items-start p-0"
            variant="empty"
          >
            <TaskStatusIcon status={task.status} />
          </Button>

          <div className="flex-1 space-y-1.5 min-w-0">
            <CardTitle
              className={cn(
                "text-sm",
                isDone
                  ? "line-through text-muted-foreground"
                  : "text-foreground",
              )}
            >
              {task.title}
            </CardTitle>

            {task.details && (
              <CardDescription className="mb-2.5">
                <NotesMarkdown size="sm" content={task.details} />
              </CardDescription>
            )}

            <div className="space-y-1.5 mt-0.5">
              {(task.priority || task.due_at) && (
                <div className="flex items-center justify-between gap-2">
                  {task.priority ? (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium font-sans tracking-wide",
                        PRIORITY_BADGE_CLASS[task.priority],
                      )}
                    >
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  ) : (
                    <span />
                  )}

                  {task.due_at && (
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs font-sans",
                        isOverdue
                          ? "text-destructive/70"
                          : "text-muted-foreground",
                      )}
                    >
                      <Calendar className="w-3 h-3 shrink-0" />
                      {format(parseLocalDate(task.due_at), "d MMM yyyy")}
                    </span>
                  )}
                </div>
              )}

              {task.assignees.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
                  <Users className="w-3 h-3 shrink-0" />
                  {task.assignees
                    .slice(0, 2)
                    .map((id) => getMemberName(id, members))
                    .join(", ")}
                  {task.assignees.length > 2 &&
                    ` +${task.assignees.length - 2}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default TaskCard;
