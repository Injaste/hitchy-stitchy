import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FC,
} from "react";
import { AnimatePresence } from "framer-motion";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import { ComponentFade } from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/error-state";
import { cardLiftStyle } from "@/lib/animations";
import { useIsMobile } from "@/hooks/use-mobile";
import PortalToApp from "@/components/custom/portal-to-app";

import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTaskLabelFilter } from "../hooks/useTaskLabelFilter";
import { useTaskDnd } from "../hooks/useTaskDnd";
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
import TasksSection from "./TasksSection";
import TaskCard from "./TaskCard";
import LabelTabs from "./LabelTabs";

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

  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (data) setLocalTasks(applyOrder(data, taskOrder));
  }, [data, taskOrder]);

  const { tabs, activeLabel, setActiveLabel, filteredTasks } =
    useTaskLabelFilter(localTasks);

  const {
    sensors,
    activeTask,
    overColumnId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useTaskDnd({ localTasks, setLocalTasks });

  const grouped = useMemo(() => {
    const order = isMobile ? STATUS_ORDER_MOBILE : STATUS_ORDER_DESKTOP;
    return order.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      tasks: filteredTasks.filter((t) => t.status === status),
    }));
  }, [filteredTasks, isMobile]);

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
        {tabs.length >= 2 && (
          <LabelTabs
            labels={tabs}
            activeLabel={activeLabel}
            onSelect={setActiveLabel}
          />
        )}
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
                isDragActive={!!activeTask}
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
