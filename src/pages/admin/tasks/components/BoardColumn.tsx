import type { FC } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { taskSectionEnter } from "@/lib/animations";

import type { Task, TaskStatus } from "../types";
import { useAccess } from "../../hooks/useAccess";
import ColumnHeader from "./ColumnHeader";
import ColumnScrollArea from "./ColumnScrollArea";
import TaskQuickAdd from "./TaskQuickAdd";

interface BoardColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  sectionDelay?: number;
}

/**
 * Single column. Layout uses CSS Grid:
 *   Row 1 (auto)            — ColumnHeader
 *   Row 2 (auto)            — Separator
 *   Row 3 (minmax(0, 1fr))  — ColumnScrollArea (the per-column scroll surface)
 *   Row 4 (auto, implicit)  — TaskQuickAdd, only when canCreate
 *
 * Mobile: plain flex column, no panel chrome. Page scrolls naturally.
 *
 * Section entrance is owned here (motion.section + taskSectionEnter
 * variant). Cards' own stagger is inside ColumnScrollArea.
 */
const BoardColumn: FC<BoardColumnProps> = ({
  status,
  label,
  tasks,
  sectionDelay = 0,
}) => {
  const { canCreate } = useAccess();

  return (
    <motion.section
      custom={sectionDelay}
      variants={taskSectionEnter}
      initial="hidden"
      animate="show"
      className={cn(
        // Mobile
        "flex flex-col gap-3 min-w-0",
        // Desktop panel
        "lg:grid lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:gap-3 lg:rounded-xl lg:bg-card/40 lg:ring-1 lg:ring-border/60 lg:p-3",
        // Hide empty columns on mobile so the page isn't cluttered
        tasks.length === 0 && "hidden lg:grid",
      )}
    >
      <ColumnHeader status={status} label={label} tasks={tasks} />
      <Separator />
      <ColumnScrollArea
        status={status}
        tasks={tasks}
        sectionDelay={sectionDelay}
      />
      {canCreate("tasks") && (
        <div className="hidden lg:block">
          <TaskQuickAdd status={status} />
        </div>
      )}
    </motion.section>
  );
};

export default BoardColumn;
