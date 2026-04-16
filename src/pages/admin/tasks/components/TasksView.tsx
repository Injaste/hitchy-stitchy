import { useMemo, type FC } from "react";
import { AnimatePresence } from "framer-motion";

import { ComponentFade } from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/error-state";

import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import {
  STATUS_LABELS,
  STATUS_ORDER_DESKTOP,
  STATUS_ORDER_MOBILE,
  type Task,
} from "../types";
import TasksSkeleton from "../states/TasksSkeleton";
import TasksEmpty from "../states/TasksEmpty";
import TasksSection from "./TasksSection";
import { useIsMobile } from "@/hooks/use-mobile";

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
  refetch,
  isRefetching,
}) => {
  const openCreate = useTaskModalStore((s) => s.openCreate);
  const isMobile = useIsMobile();
  const { canCreate } = useAccess();

  const grouped = useMemo(() => {
    if (!data) return [];
    const order = isMobile ? STATUS_ORDER_MOBILE : STATUS_ORDER_DESKTOP;

    return order.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      tasks: data.filter((t) => t.status === status),
    }));
  }, [data, isMobile]);

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
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-6 lg:overflow-x-auto lg:pb-2">
          {grouped.map(({ status, label, tasks }) => (
            <TasksSection key={status} label={label} tasks={tasks} />
          ))}
        </div>
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default TasksView;
