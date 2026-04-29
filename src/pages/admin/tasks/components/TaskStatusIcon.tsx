import type { FC } from "react";
import { Check } from "lucide-react";
import type { TaskStatus } from "../types";

interface TaskStatusIconProps {
  status: TaskStatus;
}

const TaskStatusIcon: FC<TaskStatusIconProps> = ({ status }) => {
  if (status === "done") {
    return (
      <div className="w-3.5 h-3.5 rounded-full bg-primary/80 flex items-center justify-center shrink-0">
        <Check className="w-2 h-2 text-primary-foreground" strokeWidth={3} />
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="w-3.5 h-3.5 rounded-full bg-primary/30 flex items-center justify-center shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/70" />
      </div>
    );
  }
  return (
    <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
  );
};

export default TaskStatusIcon;
