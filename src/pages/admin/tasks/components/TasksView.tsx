import { useState, useEffect, useMemo, useCallback, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensors,
  useSensor,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { getEventCoordinates } from "@dnd-kit/utilities";
import { useQueryClient } from "@tanstack/react-query";

import { ComponentFade } from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/error-state";
import { cardLiftStyle } from "@/lib/animations";
import { adminKeys } from "@/pages/admin/lib/queryKeys";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTaskMutations } from "../queries";
import {
  STATUS_LABELS,
  STATUS_ORDER_DESKTOP,
  STATUS_ORDER_MOBILE,
  type Task,
  type TaskOrder,
  type TaskStatus,
} from "../types";
import TasksSkeleton from "../states/TasksSkeleton";
import TasksEmpty from "../states/TasksEmpty";
import TasksSection from "./TasksSection";
import TaskCard from "./TaskCard";
import { useIsMobile } from "@/hooks/use-mobile";
import PortalToApp from "@/components/custom/portal-to-app";

interface TasksViewProps {
  data: Task[] | undefined;
  taskOrder: TaskOrder | null | undefined;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

function applyOrder(
  tasks: Task[],
  order: TaskOrder | null | undefined,
): Task[] {
  if (!order) return tasks;
  const orderMap: Record<TaskStatus, string[]> = {
    todo: order.todo,
    in_progress: order.in_progress,
    done: order.done,
  };
  return [...tasks].sort((a, b) => {
    const aList = orderMap[a.status];
    const bList = orderMap[b.status];
    const aIdx = aList.indexOf(a.id);
    const bIdx = bList.indexOf(b.id);
    const aPos = aIdx === -1 ? Infinity : aIdx;
    const bPos = bIdx === -1 ? Infinity : bIdx;
    return aPos - bPos;
  });
}

const TasksView: FC<TasksViewProps> = ({
  data,
  taskOrder,
  isLoading,
  isError,
  refetch,
  isRefetching,
}) => {
  const openCreate = useTaskModalStore((s) => s.openCreate);
  const isMobile = useIsMobile();
  const { canCreate } = useAccess();
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();
  const { saveOrder } = useTaskMutations();

  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumnId, setOverColumnId] = useState<TaskStatus | null>(null);

  useEffect(() => {
    if (data) setLocalTasks(applyOrder(data, taskOrder));
  }, [data, taskOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  const grouped = useMemo(() => {
    const order = isMobile ? STATUS_ORDER_MOBILE : STATUS_ORDER_DESKTOP;
    return order.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      tasks: localTasks.filter((t) => t.status === status),
    }));
  }, [localTasks, isMobile]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = localTasks.find((t) => t.id === event.active.id);
      setActiveTask(task ?? null);
    },
    [localTasks],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeTask = localTasks.find((t) => t.id === activeId);
      if (!activeTask) return;

      // over.id is either a task id or a column status id
      const overTask = localTasks.find((t) => t.id === overId);
      const destStatus: TaskStatus = overTask
        ? overTask.status
        : (overId as TaskStatus);

      setOverColumnId(destStatus);

      if (activeTask.status === destStatus) {
        // Reorder within same column
        if (overTask && activeId !== overId) {
          setLocalTasks((prev) => {
            const srcIdx = prev.findIndex((t) => t.id === activeId);
            const dstIdx = prev.findIndex((t) => t.id === overId);
            return arrayMove(prev, srcIdx, dstIdx);
          });
        }
        return;
      }

      // Move to different column — insert before the over task (or append)
      setLocalTasks((prev) => {
        const withUpdatedStatus = prev.map((t) =>
          t.id === activeId ? { ...t, status: destStatus } : t,
        );
        if (overTask) {
          const srcIdx = withUpdatedStatus.findIndex((t) => t.id === activeId);
          const dstIdx = withUpdatedStatus.findIndex((t) => t.id === overId);
          return arrayMove(withUpdatedStatus, srcIdx, dstIdx);
        }
        return withUpdatedStatus;
      });
    },
    [localTasks],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      setOverColumnId(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;
      const activeTaskFinal = localTasks.find((t) => t.id === activeId);
      if (!activeTaskFinal) return;

      const overTask = localTasks.find((t) => t.id === overId);
      const destStatus: TaskStatus = overTask
        ? overTask.status
        : (overId as TaskStatus);

      // If same column and same position, no-op
      if (activeTaskFinal.status === destStatus && activeId === overId) return;

      // Build order from current localTasks state
      const newOrder: TaskOrder = {
        event_id: eventId ?? "",
        todo: localTasks.filter((t) => t.status === "todo").map((t) => t.id),
        in_progress: localTasks
          .filter((t) => t.status === "in_progress")
          .map((t) => t.id),
        done: localTasks.filter((t) => t.status === "done").map((t) => t.id),
      };

      // Commit optimistically to cache
      queryClient.setQueryData(adminKeys.tasks(slug!), localTasks);
      queryClient.setQueryData(adminKeys.taskOrder(slug!), newOrder);

      saveOrder.mutate(newOrder);
    },
    [localTasks, queryClient, slug, eventId, saveOrder],
  );

  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton">
          <TasksSkeleton />
        </ComponentFade>
      );

    if (isError)
      return (
        <ComponentFade key="error">
          <ErrorState
            message="We couldn't load your tasks. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );

    if (!data?.length)
      return (
        <ComponentFade key="empty">
          <TasksEmpty onAdd={openCreate} canCreate={canCreate("tasks")} />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-6 lg:overflow-x-auto lg:pb-2">
            {grouped.map(({ status, label, tasks }) => (
              <TasksSection
                key={status}
                status={status}
                label={label}
                tasks={tasks}
                isDragTarget={
                  overColumnId === status && activeTask?.status !== status
                }
              />
            ))}
          </div>

          {activeTask && (
            <PortalToApp>
              <motion.div animate={cardLiftStyle} initial={false}>
                <TaskCard task={activeTask} />
              </motion.div>
            </PortalToApp>
          )}
        </DndContext>
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default TasksView;
