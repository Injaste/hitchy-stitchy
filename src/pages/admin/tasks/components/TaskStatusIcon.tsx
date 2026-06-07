import type { FC } from "react";
import { Circle, CircleDot, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "../types";

interface TaskStatusIconProps {
  status: TaskStatus;
  className?: string;
}

const TaskStatusIcon: FC<TaskStatusIconProps> = ({ status, className }) => {
  if (status === "done") {
    return (
      <CircleCheck
        className={cn(
          "size-6 shrink-0 text-primary-foreground fill-success",
          className,
        )}
        strokeWidth={2}
      />
    );
  }
  if (status === "in_progress") {
    return (
      <CircleDot
        className={cn(
          "size-5 shrink-0 text-primary/60 fill-primary/20",
          className,
        )}
        strokeWidth={2}
      />
    );
  }
  return (
    <Circle
      className={cn("size-5 shrink-0 text-border", className)}
      strokeWidth={2}
    />
  );
};

export default TaskStatusIcon;
