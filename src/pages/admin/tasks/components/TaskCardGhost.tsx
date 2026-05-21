import type { FC } from "react";
import { AnimatePresence } from "framer-motion";

import {
  useTaskGhostAbove,
  useTaskGhostBelow,
  useColumnEndGhost,
} from "../hooks/useTaskDnd";
import type { TaskStatus } from "../types";
import TaskDragGhost from "./TaskDragGhost";

/**
 * Small subscribers that render a TaskDragGhost only when the store
 * says this exact slot is the active drop target. Isolating these into
 * their own components means a drag transition only re-renders the two
 * tiny ghost wrappers — the underlying TaskCard never re-renders just
 * because the drag indicator moved.
 */

export const TaskCardGhostAbove: FC<{ taskId: string }> = ({ taskId }) => {
  const show = useTaskGhostAbove(taskId);
  return (
    <AnimatePresence mode="popLayout">
      {show && <TaskDragGhost key="g-above" className="mb-3" />}
    </AnimatePresence>
  );
};

export const TaskCardGhostBelow: FC<{ taskId: string }> = ({ taskId }) => {
  const show = useTaskGhostBelow(taskId);
  return (
    <AnimatePresence mode="popLayout">
      {show && <TaskDragGhost key="g-below" className="mt-3" />}
    </AnimatePresence>
  );
};

export const ColumnEndGhost: FC<{ status: TaskStatus }> = ({ status }) => {
  const show = useColumnEndGhost(status);
  return (
    <AnimatePresence mode="popLayout">
      {show && <TaskDragGhost key="g-end" />}
    </AnimatePresence>
  );
};
