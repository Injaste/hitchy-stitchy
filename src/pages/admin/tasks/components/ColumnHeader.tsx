import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { Task, TaskStatus } from "../types";
import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import TaskStatusIcon from "./TaskStatusIcon";

interface ColumnHeaderProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}

/**
 * Column header row — status dot, label, animated count, optional
 * "Archive all" button on the `done` column. Sits at the section's
 * content edge (no extra padding; section's lg:p-3 provides the inset).
 */
const ColumnHeader: FC<ColumnHeaderProps> = ({ status, label, tasks }) => {
  const { canDelete } = useAccess();
  const openArchive = useTaskModalStore((s) => s.openArchive);
  const isDone = status === "done";
  const hasTasks = tasks.length > 0;

  return (
    <div className="flex items-center gap-2 lg:min-h-8">
      <TaskStatusIcon status={status} />
      <span className="text-sm font-display font-medium text-foreground/70">
        {label}
      </span>

      <AnimatePresence>
        {hasTasks && (
          <motion.span
            key="count"
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
          {hasTasks && (
            <motion.div
              key="archive"
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
  );
};

export default ColumnHeader;
