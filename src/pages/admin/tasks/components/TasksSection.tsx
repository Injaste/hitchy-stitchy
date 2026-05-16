import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";
import { taskContainer, taskItem } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import type { Task, TaskStatus } from "../types";
import DraggableTaskCard from "./DraggableTaskCard";
import TaskStatusIcon from "./TaskStatusIcon";
import TaskQuickAdd from "./TaskQuickAdd";
import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";

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

  const { canCreate, canDelete } = useAccess();
  const openArchive = useTaskModalStore((s) => s.openArchive);

  const isDone = status === "done";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 min-w-0 lg:min-w-[360px]",
        tasks.length === 0 && "hidden lg:flex",
      )}
    >
      <div className="flex flex-col justify-between h-8">
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

          {isDone && canDelete("tasks") && (
            <AnimatePresence>
              {tasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-auto"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openArchive(tasks)}
                    className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Archive className="size-3.5" />
                    Archive all
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
        <Separator />
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
              {canCreate("tasks") && (
                <motion.div
                  key="create-task-last"
                  variants={taskItem}
                  exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
                  layout={!isDragActive}
                  transition={{
                    layout: { duration: 0.2, ease: [0.2, 0, 0, 1] },
                  }}
                >
                  <TaskQuickAdd status={status as TaskStatus} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </SortableContext>
    </div>
  );
};

export default TasksSection;
