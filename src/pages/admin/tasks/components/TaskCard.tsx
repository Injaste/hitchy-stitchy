import type { FC } from "react";
import { Calendar, GripVertical } from "lucide-react";
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

import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useCardFly } from "../hooks/useCardFly";
import { useTaskMutations } from "../queries";
import { type Task, type TaskPriority, type TaskStatus } from "../types";
import { Button } from "@/components/ui/button";
import TaskStatusIcon from "./TaskStatusIcon";
import AssigneeStack from "../../components/AssigneeStack";

interface TaskCardProps {
  task: Task;
  dragHandleRef?: (element: Element | null) => void;
  isDragging?: boolean;
}

const priorityBar: Record<TaskPriority, string> = {
  high: "bg-destructive/70",
  medium: "bg-warning/60",
  low: "bg-foreground/30",
};

/**
 * Pure-presentation task card. No drag-and-drop wiring lives here —
 * the SortableTaskItem wrapper in TasksSection owns the dnd-kit sortable
 * registration and supplies the drag transform via inline style. Click
 * opens the detail modal; clicks bubble up through the wrapper's drag
 * listeners (dnd-kit treats a click without movement as a click, not a
 * drag).
 */
const TaskCard: FC<TaskCardProps> = ({ task, dragHandleRef, isDragging }) => {
  const openDetail = useTaskModalStore((s) => s.openDetail);
  const { update } = useTaskMutations();
  const isFlying = useCardFly((s) => s.flight?.id === task.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next: TaskStatus = task.status === "done" ? "todo" : "done";
    // checkbox teleports the card to another column → fly it there,
    // ringed green when completing (into Done), neutral when reopening
    useCardFly
      .getState()
      .takeOff(task.id, next === "done" ? "success" : undefined);
    update.mutate(
      { ...task, status: next },
      {
        onSuccess: () => useCardFly.getState().land(task.id),
        onError: () => useCardFly.getState().clear(),
      },
    );
  };

  const isDone = task.status === "done";
  const isOverdue =
    !isDone &&
    !!task.due_at &&
    isBefore(parseLocalDate(task.due_at), startOfToday());

  const hasMeta = !!task.due_at || task.assignees.length > 0;

  return (
    <Card
      data-task-id={task.id}
      onClick={() => openDetail(task)}
      variant="interactive"
      size="sm"
      className={cn(
        "group/task-card relative gap-2 transition-all shadow-xs",
        isDone && "opacity-60",
        // Overdue owns its ring at every state so the shared
        // interactive `hover:ring-secondary` can't flip the alarm green.
        isOverdue && "ring-destructive/40 hover:ring-destructive/60",
        // While being dragged, the card carries a success ring (wins over
        // the base/overdue/interactive rings via order + width).
        isDragging && "ring-2 ring-success shadow-lg",
        // hidden while its clone is mid-flight (useCardFly)
        isFlying && "opacity-0",
      )}
    >
      {/* Priority — the single priority signal */}
      {task.priority && (
        <span
          className={cn(
            "absolute left-0 inset-y-2 w-1 rounded-full",
            priorityBar[task.priority],
          )}
        />
      )}

      {/* Drag handle — only when draggable (tasks:update). Always visible on
          mobile, appears on hover on desktop. */}
      {dragHandleRef && (
        <button
          ref={dragHandleRef}
          type="button"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "absolute top-2 right-2 z-10 rounded p-1 touch-none",
            "cursor-grab active:cursor-grabbing",
            "text-muted-foreground/40 hover:text-muted-foreground/70",
            "transition-opacity",
            "opacity-100 md:opacity-0 md:group-hover/task-card:opacity-100",
          )}
        >
          <GripVertical className="size-4" />
        </button>
      )}

      <CardHeader className="gap-2">
        <div className="flex items-start gap-2.5 pr-6">
          <Button
            onClick={handleToggle}
            className="group/task-button-hover relative shrink-0 items-start -mx-2.5 h-fit"
            variant="empty"
          >
            <TaskStatusIcon
              status={task.status}
              className={cn(
                task.status !== "done" &&
                  "transition-opacity group-hover/task-button-hover:opacity-0",
              )}
            />
            {task.status !== "done" && (
              <TaskStatusIcon
                status="done"
                className="absolute -top-0.5 opacity-0 transition-opacity group-hover/task-button-hover:opacity-100"
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
          <CardDescription className="line-clamp-2">
            <NotesMarkdown size="sm" content={task.details} />
          </CardDescription>
        )}

        {hasMeta && (
          <div className="flex items-center justify-between gap-2">
            {task.due_at ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-sans",
                  isOverdue
                    ? "text-destructive font-medium"
                    : "text-muted-foreground",
                )}
              >
                <Calendar className="size-3 shrink-0" />
                {isOverdue && "Overdue · "}
                {format(parseLocalDate(task.due_at), "d MMM")}
              </span>
            ) : (
              <span />
            )}
            <AssigneeStack ids={task.assignees} />
          </div>
        )}
      </CardHeader>
    </Card>
  );
};

export default TaskCard;
