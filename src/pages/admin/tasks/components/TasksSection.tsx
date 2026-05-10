import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";
import { taskContainer, taskItem } from "@/lib/animations";

import type { Task, TaskStatus } from "../types";
import DraggableTaskCard from "./DraggableTaskCard";
import TaskStatusIcon from "./TaskStatusIcon";
import { Button } from "@/components/ui/button";
import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { Plus } from "lucide-react";

interface TasksSectionProps {
  status: string;
  label: string;
  tasks: Task[];
  isDragTarget?: boolean;
  isDragSource?: boolean;
  isDragActive?: boolean;
}

const TasksSection: FC<TasksSectionProps> = ({
  status,
  label,
  tasks,
  isDragTarget,
  isDragSource,
  isDragActive,
}) => {
  const { setNodeRef } = useDroppable({ id: status });
  const taskIds = tasks.map((t) => t.id);

  const { canCreate } = useAccess();
  const openCreate = useTaskModalStore((s) => s.openCreate);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 min-w-0 lg:min-w-[360px]",
        tasks.length === 0 && "hidden lg:flex",
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TaskStatusIcon status={status as TaskStatus} />
          <span className="text-sm font-display font-medium text-foreground/70">
            {label}
          </span>
          <AnimatePresence>
            {tasks.length > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-2 text-xs text-muted-foreground tabular-nums"
              >
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="h-px bg-border/50" />
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-col gap-3 min-h-[60px] rounded-xl p-2 ring-1 ring-transparent transition-colors duration-150",
            isDragTarget && "ring-primary/40 bg-primary/10",
            isDragSource && "ring-border bg-muted/30",
          )}
        >
          <motion.div
            variants={taskContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3"
          >
            <AnimatePresence>
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={taskItem}
                  exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
                  layout={!isDragActive}
                  transition={{
                    layout: { duration: 0.2, ease: [0.2, 0, 0, 1] },
                  }}
                >
                  <DraggableTaskCard task={task} />
                </motion.div>
              ))}
              <motion.div
                key="create-task-last"
                variants={taskItem}
                exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
                layout={!isDragActive}
                transition={{
                  layout: { duration: 0.2, ease: [0.2, 0, 0, 1] },
                }}
              >
                {canCreate("tasks") && (
                  <Button
                    className="hidden lg:flex w-full max-w-md min-h-[74px] items-center justify-center px-4 rounded-xl border border-dashed border-border"
                    variant="ghost"
                    onClick={openCreate}
                  >
                    <Plus className="size-4.5" /> Add task
                  </Button>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </SortableContext>
    </div>
  );
};

export default TasksSection;
