import type { FC, ReactNode } from "react";
import { Check, Calendar } from "lucide-react";
import { format } from "date-fns";

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
import type { Task, TaskPriority, TaskStatus } from "../types";

interface TaskCardProps {
  task: Task;
}

const priorityBar: Record<TaskPriority, string> = {
  high: "bg-destructive/60",
  medium: "bg-primary/50",
  low: "bg-secondary/40",
};

const statusCard: Record<TaskStatus, string> = {
  todo: "",
  in_progress: "ring-primary/30",
  done: "opacity-60",
};

const nextStatus: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const TaskCard: FC<TaskCardProps> = ({ task }) => {
  const openDetail = useTaskModalStore((s) => s.openDetail);
  const { update } = useTaskMutations();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    update.mutate({ id: task.id, status: nextStatus[task.status] });
  };

  const isDone = task.status === "done";

  let statusEl: ReactNode;
  if (task.status === "done") {
    statusEl = (
      <div className="w-5 h-5 rounded-full bg-primary/80 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-primary-foreground" strokeWidth={2.5} />
      </div>
    );
  } else if (task.status === "in_progress") {
    statusEl = (
      <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary/70" />
      </div>
    );
  } else {
    statusEl = (
      <div className="w-5 h-5 rounded-full border border-border shrink-0" />
    );
  }

  return (
    <Card
      className={cn("relative cursor-pointer overflow-visible w-full max-w-md", statusCard[task.status])}
      onClick={() => openDetail(task)}
    >
      <div
        className={cn(
          "absolute left-0 inset-y-2 w-1 rounded-full",
          task.priority ? priorityBar[task.priority] : "bg-border",
        )}
      />

      <CardHeader className="pl-6">
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggle}
            className="shrink-0 mt-0.5"
            aria-label="Toggle task status"
          >
            {statusEl}
          </button>

          <div className="flex-1 space-y-1.5 min-w-0">
            <CardTitle
              className={cn(
                "text-sm",
                isDone ? "line-through text-muted-foreground" : "text-foreground",
              )}
            >
              {task.title}
            </CardTitle>

            {task.details && (
              <CardDescription>
                <NotesMarkdown minified content={task.details} />
              </CardDescription>
            )}

            {task.due_at && (
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-sans">
                <Calendar className="w-3 h-3" />
                {format(parseLocalDate(task.due_at), "d MMM yyyy")}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default TaskCard;
