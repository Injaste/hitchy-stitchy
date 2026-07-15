import type { FC } from "react";

import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useCardFly } from "../hooks/useCardFly";
import { useTaskMutations } from "../queries";
import { type Task, type TaskStatus } from "../types";
import TaskCardView from "./TaskCardView";

interface TaskCardProps {
  task: Task;
  dragHandleRef?: (element: Element | null) => void;
  isDragging?: boolean;
}

/**
 * Task card container — wires the detail modal, the status-toggle mutation, and
 * the card-fly animation, then renders the pure TaskCardView. The view is
 * shared with the marketing showcase so the card never forks. No drag-and-drop
 * wiring lives here — the SortableTaskItem wrapper in TasksSection owns the
 * dnd-kit registration; a click without movement bubbles through as a click.
 */
const TaskCard: FC<TaskCardProps> = ({ task, dragHandleRef, isDragging }) => {
  const openDetail = useTaskModalStore((s) => s.openDetail);
  const { update } = useTaskMutations();
  const isFlying = useCardFly((s) => Boolean(s.flights[task.id]));

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next: TaskStatus = task.status === "done" ? "todo" : "done";
    // checkbox teleports the card to another column → fly it there with the
    // same green ring the card wears while dragging, whichever way it moves
    useCardFly.getState().takeOff(task.id, "success");
    update.mutate(
      { ...task, status: next },
      {
        onSuccess: () => useCardFly.getState().land(task.id),
        onError: () => useCardFly.getState().clear(task.id),
      },
    );
  };

  return (
    <TaskCardView
      task={task}
      onToggle={handleToggle}
      onOpen={() => openDetail(task)}
      dragHandleRef={dragHandleRef}
      isDragging={isDragging}
      isFlying={isFlying}
    />
  );
};

export default TaskCard;
