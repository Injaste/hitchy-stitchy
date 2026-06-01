import type { FC } from "react";
import { Calendar, GripVertical, Users } from "lucide-react";
import { format, isBefore, startOfToday } from "date-fns";

import { cn } from "@/lib/utils";
import { parseLocalDate } from "@/lib/utils/utils-time";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NotesMarkdown from "@/components/custom/notes-markdown";
import { Badge } from "@/components/ui/badge";

import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTaskMutations } from "../queries";
import MemberBadge from "@/pages/admin/members/components/MemberBadge";
import {
  PRIORITY_BADGE_CLASS,
  PRIORITY_LABELS,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "../types";
import { Button } from "@/components/ui/button";
import TaskStatusIcon from "./TaskStatusIcon";

interface TaskCardProps {
  task: Task;
  dragHandleRef?: (element: Element | null) => void;
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

/**
 * Pure-presentation task card. No drag-and-drop wiring lives here —
 * the SortableTaskItem wrapper in TasksSection owns the dnd-kit sortable
 * registration and supplies the drag transform via inline style. Click
 * opens the detail modal; clicks bubble up through the wrapper's drag
 * listeners (dnd-kit treats a click without movement as a click, not a
 * drag).
 */
const TaskCard: FC<TaskCardProps> = ({ task, dragHandleRef }) => {
  const openDetail = useTaskModalStore((s) => s.openDetail);
  const { update } = useTaskMutations();

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
      data-task-id={task.id}
      onClick={() => openDetail(task)}
      variant="interactive"
      className={cn(
        "group/task-card relative",
        statusCard[task.status],
        isOverdue && "ring-1 ring-destructive/30",
      )}
    >
      {isOverdue && (
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-destructive animate-pulse" />
      )}

      <div
        className={cn(
          "absolute left-0 inset-y-2 w-1 rounded-full",
          task.priority ? priorityBar[task.priority] : "bg-border",
        )}
      />

      {/* Drag handle — always visible on mobile, appears on hover on desktop */}
      <button
        ref={dragHandleRef}
        type="button"
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute top-2.5 right-2.5 z-10 rounded p-1 touch-none",
          "cursor-grab active:cursor-grabbing",
          "text-muted-foreground/40 hover:text-muted-foreground/70",
          "transition-opacity duration-150",
          "opacity-100 lg:opacity-0 lg:group-hover/task-card:opacity-100",
        )}
      >
        <GripVertical className="size-4" />
      </button>

      <CardHeader className="space-y-1.5">
        <div className="flex items-start gap-3 pr-6">
          <Button
            onClick={handleToggle}
            className="group/task-button-hover relative shrink-0 items-start -mx-2.5 h-fit"
            variant="empty"
          >
            <TaskStatusIcon status={task.status} />
            {task.status !== "done" && (
              <TaskStatusIcon
                status="done"
                className="absolute -top-0.5 opacity-0 transition-opacity duration-200 group-hover/task-button-hover:opacity-60"
              />
            )}
          </Button>
          <CardTitle
            className={cn(
              "text-sm",
              isDone ? "line-through text-muted-foreground" : "text-foreground",
            )}
          >
            {task.title}
          </CardTitle>
        </div>

        {task.details && (
          <CardDescription>
            <NotesMarkdown size="sm" content={task.details} />
          </CardDescription>
        )}

        <div className="space-y-1.5">
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
                    isOverdue ? "text-destructive/70" : "text-muted-foreground",
                  )}
                >
                  <Calendar className="w-3 h-3 shrink-0" />
                  {format(parseLocalDate(task.due_at), "d MMM yyyy")}
                </span>
              )}
            </div>
          )}

          {task.assignees.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3 shrink-0" />
              {task.assignees.slice(0, 2).map((id) => (
                <MemberBadge key={id} memberId={id} variant="secondary" />
              ))}
              {task.assignees.length > 2 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  +{task.assignees.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export default TaskCard;
