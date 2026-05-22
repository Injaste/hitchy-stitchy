import { type CSSProperties, type FC } from "react";
import { Archive } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  label: string;
  taskIds: string[];
  tasksById: Map<string, Task>;
}

/**
 * Single kanban column.
 *
 * Receives the id list for its column from TasksView (which keeps the
 * canonical multi-container `items` state in useTaskDnd). Looks each
 * task up via `tasksById` when rendering. This matches the canonical
 * MultipleContainers pattern: ids drive ordering, the SortableContext
 * sees a stable `items` array, and the actual Task data is just a
 * dictionary lookup.
 *
 * dnd-kit wiring:
 *   - useDroppable({ id: status }) so empty-column drops route here.
 *   - SortableContext over the id list with vertical strategy.
 *   - Inline SortableTaskItem applies transform/transition + dim.
 */
const TasksSection: FC<TasksSectionProps> = ({
  status,
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

  const { setNodeRef: setDroppableRef, isOver: isOverColumn } = useDroppable({
    id: status,
  });

  const { canCreate, canDelete } = useAccess();
  const openArchive = useTaskModalStore((s) => s.openArchive);
  const isDone = status === "done";
  const count = taskIds.length;
  const hasTasks = count > 0;

  return (
    <section
      className={cn(
        "flex flex-col gap-3 min-w-0",
        "lg:grid lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:gap-3 lg:rounded-xl lg:bg-card/40 lg:ring-1 lg:ring-border/60 lg:p-3",
        hasTasks ? "" : "hidden lg:grid",
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
      <div className="relative lg:min-h-0">
        <ScrollGradient
          side="top"
          visible={canScrollUp}
          fromClass="from-card/60"
        />
        <div
          ref={scrollRef}
          onScroll={onScrollUpdate}
          className="flex flex-col gap-3 lg:absolute lg:inset-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable] lg:[scrollbar-width:thin]"
        >
          <div
            ref={setDroppableRef}
            className={cn(
              "flex flex-col gap-3 min-h-[60px] rounded-xl ring-1 ring-transparent transition-colors duration-150",
              isOverColumn && "ring-primary/40 bg-primary/5",
            )}
          >
            <SortableContext
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              {taskIds.map((id) => {
                const task = tasksById.get(id);
                if (!task) return null;
                return <SortableTaskItem key={id} task={task} />;
              })}
            </SortableContext>
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
    </section>
  );
};

/* ─────────────────────────── Sortable card ─────────────────────────── */

/**
 * Canonical MultipleContainers SortableItem shape: setNodeRef +
 * style with transform/transition/opacity + spread attrs/listeners on
 * a plain div. No framer-motion.
 */
const SortableTaskItem: FC<{ task: Task }> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
};

export default TasksSection;
