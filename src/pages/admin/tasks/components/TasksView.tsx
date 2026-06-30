import { useMemo, type FC } from "react";
import { AnimatePresence } from "framer-motion";
import { DragDropProvider } from "@dnd-kit/react";
import { Feedback } from "@dnd-kit/dom";

import ComponentFade from "@/components/animations/animate-component-fade";
import Container from "@/components/custom/container";
import ErrorState from "@/components/custom/states/error-state";
import { ScrollView } from "@/components/custom/scroll-view";

import { useAccess } from "../../hooks/useAccess";
import { useLimitGuard } from "../../plan/hooks/useLimitGuard";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTasksFilter } from "../hooks/useTasksFilter";
import { useTaskDnd, type ItemsByStatus } from "../hooks/useTaskDnd";
import {
  STATUS_LABELS,
  STATUS_ORDER_DESKTOP,
  type Task,
  type TaskStatus,
} from "../types";
import TasksSkeleton from "../states/TasksSkeleton";
import TasksEmpty from "../states/TasksEmpty";
import TasksSection from "./TasksSection";
import TasksDndErrorBoundary from "./TasksDndErrorBoundary";

interface TasksViewProps {
  data: Task[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const TasksView: FC<TasksViewProps> = ({
  data,
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const openCreate = useTaskModalStore((s) => s.openCreate);
  const guardAdd = useLimitGuard();
  const { canCreate, canUpdate } = useAccess();
  const canDrag = canUpdate("tasks");

  // Server returns ORDER BY status, position; we re-sort client-side so
  // optimistic position writes (drag, checkbox) reflect before any refetch.
  // Bucketing by status below means a flat (position, created_at) sort yields
  // the right order within each column.
  const orderedTasks = useMemo(
    () =>
      data
        ? [...data].sort(
            (a, b) =>
              a.position - b.position ||
              a.created_at.localeCompare(b.created_at),
          )
        : [],
    [data],
  );

  const { filteredTasks } = useTasksFilter(orderedTasks);

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

  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton" useBlur>
          <TasksSkeleton />
        </ComponentFade>
      );

    if (isError)
      return (
        <ComponentFade key="error" useBlur>
          <ErrorState
            message="We couldn't load your tasks. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );

    if (!data?.length)
      return (
        <ComponentFade key="empty" useBlur>
          <TasksEmpty onAdd={() => { if (guardAdd("tasks")) return; openCreate(); }} canCreate={canCreate("tasks")} />
        </ComponentFade>
      );

    const staticBoard = (
      <Board items={baseItemsByStatus} tasksById={tasksById} canDrag={false} />
    );

    return (
      <ComponentFade key="content" useBlur>
        <div className="md:h-full md:grid md:grid-rows-[minmax(0,1fr)]">
          {canDrag ? (
            <TasksDndErrorBoundary fallback={staticBoard}>
              <DragDropProvider
                plugins={(defaults) => [
                  ...defaults.filter((p) => p !== Feedback),
                  Feedback.configure({ feedback: "clone" }),
                ]}
                sensors={sensors}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
              >
                <Board items={items} tasksById={tasksById} canDrag />
              </DragDropProvider>
            </TasksDndErrorBoundary>
          ) : (
            staticBoard
          )}
        </div>
      </ComponentFade>
    );
  };

  return (
    <Container
      pageSpacing
      className="flex flex-col md:mt-6 md:flex-1 md:min-h-0 md:grid md:grid-rows-[minmax(0,1fr)]"
    >
      <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
    </Container>
  );
};

/**
 * The lane board. Two layouts:
 *  - Below md: lanes stack vertically (CSS order puts In progress first); the
 *    page scrolls the whole stack.
 *  - md and up: a 3-column grid that fills the height, each lane scrolling its
 *    own cards independently. Lanes hold a 300px min width and the board
 *    scrolls horizontally once they no longer fit, so cards never get cramped.
 */
const Board: FC<{
  items: ItemsByStatus;
  tasksById: Map<string, Task>;
  canDrag: boolean;
}> = ({ items, tasksById, canDrag }) => (
  <ScrollView
    axis="x"
    gradientLeft
    gradientRight
    mainClass="min-w-0 md:h-full md:min-h-0 md:-mx-1"
    className="os-scroll-x-flush md:px-1 md:pt-1 md:pb-2"
  >
    {/* As a child of the OverlayScrollbars viewport (rather than the scroll
        container itself), a block grid would never exceed the viewport width,
        so it would never overflow to scroll. The md:min-w floor forces it wider
        than the viewport once the lanes hit their 300px min — 3×300 + 2×gap-5
        (2.5rem) — while 1fr still lets them share the width on roomier screens. */}
    <div className="flex flex-col gap-5 md:grid md:h-full md:min-w-[calc(900px+2.5rem)] md:grid-cols-[repeat(3,minmax(300px,1fr))]">
      {(STATUS_ORDER_DESKTOP as TaskStatus[]).map((status, columnIndex) => (
        <TasksSection
          key={status}
          status={status}
          index={columnIndex}
          label={STATUS_LABELS[status]}
          taskIds={items[status]}
          tasksById={tasksById}
          canDrag={canDrag}
        />
      ))}
    </div>
  </ScrollView>
);

export default TasksView;
