import { memo, type FC } from "react";
import { motion } from "framer-motion";
import { Archive } from "lucide-react";
import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { CollisionPriority } from "@dnd-kit/abstract";

import { taskSectionEnter } from "@/lib/animations";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";
import ScrollGradient from "@/components/custom/scroll-gradient";

import type { Task, TaskStatus } from "../types";
import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import TaskCard from "./TaskCard";
import TaskQuickAdd from "./TaskQuickAdd";
import TaskStatusIcon from "./TaskStatusIcon";

interface TasksSectionProps {
  status: TaskStatus;
  index: number;
  label: string;
  taskIds: string[];
  tasksById: Map<string, Task>;
  canDrag: boolean;
}

// Stacked (mobile) order: In progress → To do → Done. Reset to DOM order
// (To do → In progress → Done) once the grid kicks in at md.
const MOBILE_ORDER: Record<TaskStatus, string> = {
  in_progress: "order-1",
  todo: "order-2",
  done: "order-3",
};

const TasksSection: FC<TasksSectionProps> = ({
  status,
  index,
  label,
  taskIds,
  tasksById,
  canDrag,
}) => {
  const {
    scrollRef,
    canScrollUp,
    canScrollDown,
    onScroll: onScrollUpdate,
  } = useScrollVisibility();

  const { ref: droppableRef } = useDroppable({
    id: status,
    type: "column",
    accept: "item",
    collisionPriority: CollisionPriority.Low,
    data: { index },
  });

  const { canCreate, canDelete } = useAccess();
  const openArchive = useTaskModalStore((s) => s.openArchive);
  const isDone = status === "done";
  const count = taskIds.length;
  const hasTasks = count > 0;
  // True when the column overflows (its vertical scrollbar is showing).
  const hasColumnScroll = canScrollUp || canScrollDown;

  return (
    <motion.section
      variants={taskSectionEnter}
      initial="hidden"
      animate="show"
      custom={index * 0.08}
      className={cn(
        "flex flex-col gap-3 min-w-0 rounded-xl bg-task-column ring-1 ring-border/60 p-3",
        MOBILE_ORDER[status],
        "md:order-0 md:grid md:grid-rows-[auto_auto_minmax(0,1fr)] md:gap-3",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 md:min-h-8">
        <TaskStatusIcon status={status} />
        <span className="text-sm font-display font-medium text-foreground/70">
          {label}
        </span>
        {hasTasks && (
          <span className="ml-2 text-xs text-muted-foreground tabular-nums">
            {count} {count === 1 ? "task" : "tasks"}
          </span>
        )}
        {isDone && canDelete("tasks") && hasTasks && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const tasks = taskIds
                .map((id) => tasksById.get(id))
                .filter((t): t is Task => !!t);
              openArchive(tasks);
            }}
            className="ml-auto h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Archive className="size-3.5" />
            Archive all
          </Button>
        )}
      </div>

      <Separator />

      {/* Scroll body */}
      <div className="relative md:min-h-0">
        <ScrollGradient
          side="top"
          visible={canScrollUp}
          fromClass="from-task-column"
        />
        <div
          ref={scrollRef}
          onScroll={onScrollUpdate}
          className="flex flex-col gap-3 md:absolute md:inset-0 md:overflow-y-auto md:[scrollbar-width:thin] md:px-2 md:pt-2"
        >
          <div
            ref={droppableRef}
            // shrink-0 stops the flex algorithm from collapsing this to the
            // viewport height (min-h lets it shrink) — otherwise cards overflow
            // past it and the bottom padding lands mid-content. The pb keeps the
            // last card one card-gap clear of the composer overlay (a scroll
            // container's own padding is dropped at the scroll end in flexbox).
            className="flex flex-col gap-3 shrink-0 md:pb-14"
          >
            {taskIds.map((id, itemIndex) => {
              const task = tasksById.get(id);
              if (!task) return null;
              return canDrag ? (
                <SortableTaskItem
                  key={id}
                  task={task}
                  group={status}
                  index={itemIndex}
                />
              ) : (
                <div key={id}>
                  <TaskCard task={task} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Composer — in-flow block below the cards on mobile; a pinned
            overlay (cards scroll under it) once the column scrolls at md. */}
        {canCreate("tasks") ? (
          <div
            className={cn(
              "pt-3 md:pointer-events-none md:absolute md:left-0 md:bottom-0 md:px-2 md:pb-2 md:pt-3 md:bg-linear-to-t md:from-task-column md:from-80% md:to-transparent",
              // While scrolling, hold the right edge clear of the 10px scrollbar
              // gutter so the composer never paints over the column's scrollbar.
              hasColumnScroll ? "md:right-2.5" : "md:right-0",
            )}
          >
            <div className="md:pointer-events-auto">
              <TaskQuickAdd status={status} />
            </div>
          </div>
        ) : (
          <ScrollGradient
            side="bottom"
            visible={canScrollDown}
            fromClass="from-task-column"
          />
        )}
      </div>
    </motion.section>
  );
};

const SortableTaskItem: FC<{
  task: Task;
  group: TaskStatus;
  index: number;
}> = ({ task, group, index }) => {
  const { ref, handleRef, isDragging } = useSortable({
    id: task.id,
    index,
    group,
    type: "item",
    accept: "item",
    transition: { duration: 200, easing: "ease" },
    data: { group },
  });

  return (
    <div
      ref={ref}
      data-dragging={isDragging || undefined}
      className="data-dragging:opacity-50"
    >
      <TaskCard task={task} dragHandleRef={handleRef} isDragging={isDragging} />
    </div>
  );
};

export default memo(TasksSection);
