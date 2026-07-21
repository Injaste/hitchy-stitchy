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

import { type Task, type TaskPriority } from "../types";
import type { Member } from "../../members/types";
import { Button } from "@/components/ui/button";
import TaskStatusIcon from "./TaskStatusIcon";
import AssigneeStack from "../../components/AssigneeStack";
import AssigneeAvatars from "../../components/AssigneeAvatars";

interface TaskCardViewProps {
  task: Task;
  /** Status toggle (checkbox) click. */
  onToggle?: () => void;
  /** Card body click — opens detail in-app. */
  onOpen?: () => void;
  dragHandleRef?: (element: Element | null) => void;
  isDragging?: boolean;
  isFlying?: boolean;
  /** When provided (e.g. the marketing showcase), render these resolved members
   *  directly instead of resolving task.assignees through the members query. */
  assigneeMembers?: Member[];
  selfId?: string | null;
}

const priorityBar: Record<TaskPriority, string> = {
  high: "bg-destructive/70",
  medium: "bg-warning/60",
  low: "bg-foreground/30",
};

/**
 * Pure presentation of a task card — no data wiring. Both the admin
 * (TaskCard, which supplies the modal/mutation/fly handlers) and the marketing
 * showcase render through this, so the card stays a single source of truth.
 */
const TaskCardView: FC<TaskCardViewProps> = ({
  task,
  onToggle,
  onOpen,
  dragHandleRef,
  isDragging,
  isFlying,
  assigneeMembers,
  selfId,
}) => {
  const isDone = task.status === "done";
  const isOverdue =
    !isDone &&
    !!task.due_at &&
    isBefore(parseLocalDate(task.due_at), startOfToday());

  const hasMeta =
    !!task.due_at ||
    task.assignees.length > 0 ||
    (assigneeMembers?.length ?? 0) > 0;

  return (
    <Card
      data-task-id={task.id}
      variant="interactive"
      size="sm"
      className={cn(
        "group/task-card relative gap-2 transition-all shadow-xs",
        isDone && "opacity-60",
        isOverdue && "ring-destructive/40 hover:ring-destructive/60",
        isDragging && "ring-2 ring-success shadow-lg",
        isFlying && "opacity-0",
      )}
    >
      {/* Whole-card hit target as a real button — focusable and labelled. It
          paints over the static content, so anything that needs its own click
          (status toggle, drag handle) out-stacks it instead of each one opting
          out of propagation. */}
      <button
        onClick={onOpen}
        aria-label={task.title}
        data-card-hit
        className="absolute inset-0 z-0 cursor-pointer rounded-[inherit]"
      />

      {/* Priority — the single priority signal */}
      {task.priority && (
        <span
          className={cn(
            "absolute left-0 inset-y-2 w-1 rounded-full",
            priorityBar[task.priority],
          )}
        />
      )}

      {/* Drag handle — only when draggable (tasks:update). */}
      {dragHandleRef && (
        <button
          ref={dragHandleRef}
          type="button"
          aria-label="Drag to reorder"
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
            onClick={onToggle}
            data-card-action
            className="group/task-button-hover shrink-0 items-start -ml-3 -mr-3.5 h-fit"
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
            {assigneeMembers ? (
              <AssigneeAvatars members={assigneeMembers} selfId={selfId} />
            ) : (
              <AssigneeStack ids={task.assignees} />
            )}
          </div>
        )}
      </CardHeader>
    </Card>
  );
};

export default TaskCardView;
