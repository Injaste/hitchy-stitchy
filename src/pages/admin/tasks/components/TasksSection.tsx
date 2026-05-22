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
import { useRegisterScrollSource } from "@/hooks/use-register-scroll-source";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";
import { useIsMobile } from "@/hooks/use-mobile";
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
}

const TasksSection: FC<TasksSectionProps> = ({
  status,
  index,
  label,
  taskIds,
  tasksById,
}) => {
  const isMobile = useIsMobile();
  const {
    scrollRef,
    canScrollUp,
    canScrollDown,
    onScroll: onScrollUpdate,
  } = useScrollVisibility();

  useRegisterScrollSource(scrollRef, !isMobile);

  const { ref: droppableRef, isDropTarget } = useDroppable({
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

  return (
    <motion.section
      variants={taskSectionEnter}
      initial="hidden"
      animate="show"
      custom={index * 0.08}
      className={cn(
        "flex flex-col gap-3 min-w-0 lg:transition-colors lg:duration-200",
        "lg:grid lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:gap-3 lg:rounded-xl lg:bg-card/40 lg:ring-1 lg:ring-border/60 lg:p-3",
        hasTasks ? "" : "hidden lg:grid",
        isDropTarget && "lg:ring-primary/40 lg:bg-primary/0.03",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 lg:min-h-8">
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
      <div className="relative lg:min-h-0 lg:-mr-3">
        <ScrollGradient
          side="top"
          visible={canScrollUp}
          fromClass="from-card/60"
        />
        <div
          ref={scrollRef}
          onScroll={onScrollUpdate}
          className="flex flex-col gap-3 lg:absolute lg:inset-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable] lg:[scrollbar-width:thin] lg:pl-1 lg:pr-3 lg:py-1"
        >
          <div
            ref={droppableRef}
            className="flex flex-col gap-3 min-h-[60px] rounded-xl p-2"
          >
            {taskIds.map((id, itemIndex) => {
              const task = tasksById.get(id);
              if (!task) return null;
              return (
                <SortableTaskItem
                  key={id}
                  task={task}
                  group={status}
                  index={itemIndex}
                />
              );
            })}
          </div>
        </div>
        <ScrollGradient
          side="bottom"
          visible={canScrollDown}
          fromClass="from-card/60"
        />
      </div>

      {/* Footer */}
      {canCreate("tasks") && (
        <div className="hidden lg:block">
          <TaskQuickAdd status={status} />
        </div>
      )}
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
      className="data-[dragging]:opacity-50"
    >
      <TaskCard task={task} dragHandleRef={handleRef} />
    </div>
  );
};

export default memo(TasksSection);
