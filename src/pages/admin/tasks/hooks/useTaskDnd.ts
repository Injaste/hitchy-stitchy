import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

import { adminKeys } from "@/pages/admin/lib/queryKeys";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { useTaskMutations } from "../queries";
import { useTaskModalStore } from "./useTaskModalStore";
import type { Task, TaskOrder, TaskStatus } from "../types";

export type ItemsByStatus = Record<TaskStatus, string[]>;

// No activation constraints — drag fires immediately on pointerdown on the
// handle. The handle is deliberate UI so accidental drags are not a concern.
// activatorElements restricts drag to the registered handle element only.
const sensors = [
  PointerSensor.configure({
    activatorElements: (source) => [source.handle ?? source.element],
  }),
  KeyboardSensor,
];

export const useTaskDnd = (
  baseItemsByStatus: ItemsByStatus,
  tasksById: Map<string, Task>,
) => {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();
  const { saveOrder, saveStatuses } = useTaskMutations();
  const setDragging = useTaskModalStore((s) => s.setDragging);

  const [items, setItems] = useState<ItemsByStatus>(baseItemsByStatus);
  const [activeId, setActiveId] = useState<string | null>(null);
  const snapshot = useRef<ItemsByStatus>(baseItemsByStatus);
  const startStatusRef = useRef<TaskStatus | null>(null);
  // Tracks whether onDragOver fired at least once. Prevents spurious
  // saveOrder calls when the handle is clicked without dragging.
  const hasMoved = useRef(false);

  useEffect(() => {
    if (activeId == null) setItems(baseItemsByStatus);
  }, [baseItemsByStatus, activeId]);

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.operation.source?.id ?? "");
      hasMoved.current = false;
      setActiveId(id);
      setDragging(true);
      snapshot.current = items;
      startStatusRef.current = tasksById.get(id)?.status ?? null;
    },
    [items, tasksById, setDragging],
  );

  const onDragOver = useCallback((event: DragOverEvent) => {
    if (event.operation.source?.type === "column") return;
    hasMoved.current = true;
    setItems((prev) => move(prev, event) as ItemsByStatus);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const startStatus = startStatusRef.current;
      const id = String(event.operation.source?.id ?? "");
      startStatusRef.current = null;
      setActiveId(null);
      setDragging(false);

      if (event.canceled) {
        setItems(snapshot.current);
        return;
      }

      // Handle clicked without dragging — nothing to persist.
      if (!hasMoved.current) return;

      if (!slug || !eventId) return;

      const endStatus = (Object.keys(items) as TaskStatus[]).find((s) =>
        items[s].includes(id),
      );

      const finalTaskOrder: TaskOrder = {
        event_id: eventId,
        todo: items.todo,
        in_progress: items.in_progress,
        done: items.done,
      };
      queryClient.setQueryData<TaskOrder>(
        adminKeys.taskOrder(slug),
        finalTaskOrder,
      );

      const moved = tasksById.get(id);
      if (moved && startStatus && endStatus && startStatus !== endStatus) {
        queryClient.setQueryData<Task[]>(adminKeys.tasks(slug), (prev) =>
          prev?.map((t) => (t.id === id ? { ...t, status: endStatus } : t)) ??
          prev,
        );
        saveStatuses.mutate({
          event_id: eventId,
          id: moved.id,
          title: moved.title,
          details: moved.details,
          label: moved.label,
          status: endStatus,
          priority: moved.priority,
          due_at: moved.due_at,
          assignees: moved.assignees,
        });
      }

      saveOrder.mutate(finalTaskOrder);
    },
    [items, slug, eventId, tasksById, queryClient, saveOrder, saveStatuses, setDragging],
  );

  return { sensors, items, activeId, onDragStart, onDragOver, onDragEnd };
};
