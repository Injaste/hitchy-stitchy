import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type CSSProperties,
  type FC,
} from "react";
import { AnimatePresence } from "framer-motion";
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
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
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
import { applyOrder, buildOrder, ordersEqual } from "../utils";
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
  const { saveOrder, saveStatuses } = useTaskMutations();

  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumnId, setOverColumnId] = useState<TaskStatus | null>(null);
  const dragStartOrderRef = useRef<TaskOrder | null>(null);
  const dragStartStatusesRef = useRef<Map<string, TaskStatus> | null>(null);

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
      dragStartOrderRef.current = buildOrder(localTasks, eventId ?? "");
      dragStartStatusesRef.current = new Map(localTasks.map((t) => [t.id, t.status]));
    },
    [localTasks, eventId],
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
    (_event: DragEndEvent) => {
      setActiveTask(null);
      setOverColumnId(null);

      const startOrder = dragStartOrderRef.current;
      const startStatuses = dragStartStatusesRef.current;
      dragStartOrderRef.current = null;
      dragStartStatusesRef.current = null;
      if (!startOrder) return;

      const newOrder = buildOrder(localTasks, eventId ?? "");
      if (ordersEqual(startOrder, newOrder)) return;

      queryClient.setQueryData(adminKeys.tasks(slug!), localTasks);
      queryClient.setQueryData(adminKeys.taskOrder(slug!), newOrder);

      if (startStatuses) {
        const changed = localTasks.find((t) => startStatuses.get(t.id) !== t.status);
        if (changed) {
          saveStatuses.mutate({
            id: changed.id,
            title: changed.title,
            details: changed.details,
            label: changed.label,
            status: changed.status,
            priority: changed.priority,
            due_at: changed.due_at,
            assignees: changed.assignees,
          });
        }
      }
      saveOrder.mutate(newOrder);
    },
    [localTasks, queryClient, slug, eventId, saveOrder, saveStatuses],
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
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-6 lg:overflow-x-auto lg:px-1 lg:-mx-1 lg:pb-2">
            {grouped.map(({ status, label, tasks }) => (
              <TasksSection
                key={status}
                status={status}
                label={label}
                tasks={tasks}
                isDragTarget={
                  overColumnId === status && activeTask?.status !== status
                }
                isDragSource={!!activeTask && activeTask.status === status}
              />
            ))}
          </div>

          <PortalToApp>
            <DragOverlay
              dropAnimation={{
                duration: 180,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}
            >
              {activeTask ? (
                <div
                  className="rounded-lg"
                  style={cardLiftStyle as CSSProperties}
                >
                  <TaskCard task={activeTask} />
                </div>
              ) : null}
            </DragOverlay>
          </PortalToApp>
        </DndContext>
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default TasksView;
