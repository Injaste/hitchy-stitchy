import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";

import { adminKeys } from "@/pages/admin/lib/queryKeys";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { useTaskMutations } from "../queries";
import type { Task, TaskOrder, TaskStatus } from "../types";
import { buildOrder, ordersEqual } from "../utils";

interface UseTaskDndArgs {
  localTasks: Task[];
  setLocalTasks: Dispatch<SetStateAction<Task[]>>;
}

export function useTaskDnd({ localTasks, setLocalTasks }: UseTaskDndArgs) {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();
  const { saveOrder, saveStatuses } = useTaskMutations();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumnId, setOverColumnId] = useState<TaskStatus | null>(null);
  const dragStartOrderRef = useRef<TaskOrder | null>(null);
  const dragStartStatusesRef = useRef<Map<string, TaskStatus> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = localTasks.find((t) => t.id === event.active.id);
      setActiveTask(task ?? null);
      dragStartOrderRef.current = buildOrder(localTasks, eventId ?? "");
      dragStartStatusesRef.current = new Map(
        localTasks.map((t) => [t.id, t.status]),
      );
    },
    [localTasks, eventId],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const draggingTask = localTasks.find((t) => t.id === activeId);
      if (!draggingTask) return;

      const overTask = localTasks.find((t) => t.id === overId);
      const destStatus: TaskStatus = overTask
        ? overTask.status
        : (overId as TaskStatus);

      setOverColumnId(destStatus);

      if (draggingTask.status === destStatus) {
        if (overTask && activeId !== overId) {
          setLocalTasks((prev) => {
            const srcIdx = prev.findIndex((t) => t.id === activeId);
            const dstIdx = prev.findIndex((t) => t.id === overId);
            return arrayMove(prev, srcIdx, dstIdx);
          });
        }
        return;
      }

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
    [localTasks, setLocalTasks],
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
        const changed = localTasks.find(
          (t) => startStatuses.get(t.id) !== t.status,
        );
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

  return {
    sensors,
    activeTask,
    overColumnId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
