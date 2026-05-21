import type { FC } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useDraggingHeight } from "../hooks/useTaskDnd";

interface TaskDragGhostProps {
  className?: string;
}

/**
 * Dotted card-shaped placeholder shown at the projected drop position.
 * Opacity-only entrance (no scale) so framer-motion's `layout` doesn't
 * re-measure mid-transition. Wrapping AnimatePresence uses popLayout so
 * exits are removed from flow immediately — siblings shift exactly
 * once per drag-over transition instead of waiting for exit to finish.
 */
const TaskDragGhost: FC<TaskDragGhostProps> = ({ className }) => {
  const height = useDraggingHeight();
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.1 },
        layout: { duration: 0.18, ease: [0.2, 0, 0, 1] },
      }}
      style={{ height: height ?? undefined }}
      className={cn(
        "rounded-xl border-2 border-dashed border-primary/40 bg-primary/5",
        className,
      )}
      aria-hidden
    />
  );
};

export default TaskDragGhost;
