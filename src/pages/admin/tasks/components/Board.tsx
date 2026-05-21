import { useMemo, type FC, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";

import ComponentFade from "@/components/animations/animate-component-fade";
import Container from "@/components/custom/container";
import ErrorState from "@/components/custom/states/error-state";
import { useIsMobile } from "@/hooks/use-mobile";

import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTasksFilter } from "../hooks/useTasksFilter";
import { useTaskMonitor } from "../hooks/useTaskDnd";
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
import BoardColumn from "./BoardColumn";

interface BoardProps {
  data: Task[] | undefined;
  taskOrder: TaskOrder | null | undefined;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

/** Delay between adjacent columns' entrance animations. */
const SECTION_STAGGER = 0.08;

/**
 * Page-level board orchestrator. Owns: data ordering + filtering, the
 * status grouping, the DnD monitor subscription, and the loading /
 * error / empty / data state machine.
 *
 * Layout is driven by CSS Grid all the way down:
 *   Container ── grid-rows: minmax(0, 1fr)
 *     ComponentFade ── grid-rows: auto, minmax(0, 1fr)
 *       FilterBar (auto)
 *       Columns row (1fr) ── grid-flow: column
 *         BoardColumn × N ── grid-rows: auto, auto, minmax(0, 1fr)
 *           Header, Separator, ScrollArea (1fr)
 *
 * No child needs `h-full` / `flex-1` / `min-h-0` to claim space — every
 * grid row hands its child a definite size, and `minmax(0, 1fr)` lets
 * children shrink to 0 so the per-column scroll surface can engage.
 */
const Board: FC<BoardProps> = ({
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

  // Subscribe once. useTaskReorder reads tasks straight from the cache,
  // so the monitor itself takes no args.
  useTaskMonitor();

  const orderedTasks = useMemo(
    () => (data ? applyOrder(data, taskOrder) : []),
    [data, taskOrder],
  );

  const { tabs, activeLabel, setActiveLabel, filteredTasks } =
    useTasksFilter(orderedTasks);

  const grouped = useMemo(() => {
    const order = isMobile ? STATUS_ORDER_MOBILE : STATUS_ORDER_DESKTOP;
    return order.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      tasks: filteredTasks.filter((t) => t.status === status),
    }));
  }, [filteredTasks, isMobile]);

  return (
    <Container className="mt-8 flex flex-col lg:mt-6 lg:flex-1 lg:min-h-0 lg:grid lg:grid-rows-[minmax(0,1fr)]">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <ComponentFade key="skeleton">
            <TasksSkeleton />
          </ComponentFade>
        ) : isError ? (
          <ComponentFade key="error">
            <ErrorState
              message="We couldn't load your tasks. Please try again."
              onRetry={refetch}
              isRetrying={isRefetching}
            />
          </ComponentFade>
        ) : !data?.length ? (
          <ComponentFade key="empty">
            <TasksEmpty onAdd={openCreate} canCreate={canCreate("tasks")} />
          </ComponentFade>
        ) : (
          <ComponentFade
            key="board"
            className="flex flex-col gap-6 lg:grid lg:h-full lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-6"
          >
            <TasksFilterBar
              tabs={tabs}
              activeLabel={activeLabel}
              onSelect={setActiveLabel}
            />
            <BoardColumns>
              {grouped.map(({ status, label, tasks }, i) => (
                <BoardColumn
                  key={status}
                  status={status}
                  label={label}
                  tasks={tasks}
                  sectionDelay={i * SECTION_STAGGER}
                />
              ))}
            </BoardColumns>
          </ComponentFade>
        )}
      </AnimatePresence>
    </Container>
  );
};

/**
 * Horizontal track of columns. Desktop: `grid-flow-col` with each
 * column at `minmax(360px, 1fr)` — equal width, overflow horizontally
 * if total width exceeds the viewport. Mobile stacks them vertically.
 */
const BoardColumns: FC<{ children: ReactNode }> = ({ children }) => (
  // lg:py-1 gives column panels' 1px ring breathing room from the row's
  // overflow-y-hidden clip — otherwise the top/bottom of each ring is
  // shaved off.
  <div className="flex flex-col gap-12 lg:grid lg:grid-flow-col lg:auto-cols-[minmax(360px,1fr)] lg:gap-6 lg:overflow-x-auto lg:overflow-y-hidden lg:px-1 lg:-mx-1 lg:py-1">
    {children}
  </div>
);

export default Board;
