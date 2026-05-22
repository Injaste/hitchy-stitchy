import { useMemo, type FC, type ReactNode } from "react";
import { DragDropProvider } from "@dnd-kit/react";

import Container from "@/components/custom/container";
import ErrorState from "@/components/custom/states/error-state";
import { useIsMobile } from "@/hooks/use-mobile";

import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTasksFilter } from "../hooks/useTasksFilter";
import { useTaskDnd, type ItemsByStatus } from "../hooks/useTaskDnd";
import {
  STATUS_LABELS,
  STATUS_ORDER_DESKTOP,
  STATUS_ORDER_MOBILE,
  type Task,
  type TaskOrder,
} from "../types";
import { applyOrder } from "../utils";
import TasksSkeleton from "../states/TasksSkeleton";
import TasksEmpty from "../states/TasksEmpty";
import TasksFilterBar from "./TasksFilterBar";
import TasksSection from "./TasksSection";

interface TasksViewProps {
  data: Task[] | undefined;
  taskOrder: TaskOrder | null | undefined;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

/**
 * Tasks board — dnd-kit v0.4 multi-sortable-lists pattern.
 *
 * Data flow:
 *   useTasksQuery → Task[] (cache)
 *   applyOrder + filter           → orderedTasks (rendered order)
 *   derive baseItemsByStatus      → which task ids live in which column
 *   derive tasksById              → O(1) lookup for SortableItem
 *   useTaskDnd(base, byId)        → owns local items + DnD handlers
 *   pass items[status]            → TasksSection (renders sortables)
 */
const TasksView: FC<TasksViewProps> = ({
  data,
  taskOrder,
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const openCreate = useTaskModalStore((s) => s.openCreate);
  const isMobile = useIsMobile();
  const { canCreate } = useAccess();

  const orderedTasks = useMemo(
    () => (data ? applyOrder(data, taskOrder) : []),
    [data, taskOrder],
  );

  const { tabs, activeLabel, setActiveLabel, filteredTasks } =
    useTasksFilter(orderedTasks);

  const order = isMobile ? STATUS_ORDER_MOBILE : STATUS_ORDER_DESKTOP;

  const baseItemsByStatus = useMemo<ItemsByStatus>(() => {
    const map: ItemsByStatus = { todo: [], in_progress: [], done: [] };
    for (const t of filteredTasks) map[t.status].push(t.id);
    return map;
  }, [filteredTasks]);

  const tasksById = useMemo(() => {
    const m = new Map<string, Task>();
    for (const t of filteredTasks) m.set(t.id, t);
    return m;
  }, [filteredTasks]);

  const { sensors, items, onDragStart, onDragOver, onDragEnd } = useTaskDnd(
    baseItemsByStatus,
    tasksById,
  );

  return (
    <Container className="mt-8 flex flex-col lg:mt-6 lg:flex-1 lg:min-h-0 lg:grid lg:grid-rows-[minmax(0,1fr)]">
      {isLoading ? (
        <TasksSkeleton />
      ) : isError ? (
        <ErrorState
          message="We couldn't load your tasks. Please try again."
          onRetry={refetch}
          isRetrying={isRefetching}
        />
      ) : !data?.length ? (
        <TasksEmpty onAdd={openCreate} canCreate={canCreate("tasks")} />
      ) : (
        <div className="flex flex-col gap-6 lg:grid lg:h-full lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-6">
          <TasksFilterBar
            tabs={tabs}
            activeLabel={activeLabel}
            onSelect={setActiveLabel}
          />
          <DragDropProvider
            sensors={sensors}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <SectionsRow>
              {order.map((status, columnIndex) => (
                <TasksSection
                  key={status}
                  status={status}
                  index={columnIndex}
                  label={STATUS_LABELS[status]}
                  taskIds={items[status]}
                  tasksById={tasksById}
                />
              ))}
            </SectionsRow>
          </DragDropProvider>
        </div>
      )}
    </Container>
  );
};

/** Horizontal track of column panels (desktop) / stack (mobile). */
const SectionsRow: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="flex flex-col gap-12 lg:grid lg:grid-flow-col lg:auto-cols-[minmax(360px,1fr)] lg:gap-6 lg:overflow-x-auto lg:overflow-y-hidden lg:px-1 lg:-mx-1 lg:py-1">
    {children}
  </div>
);

export default TasksView;
