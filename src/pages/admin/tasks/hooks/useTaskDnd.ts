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
import type { Task, TaskOrder, TaskStatus } from "../types";

export type ItemsByStatus = Record<TaskStatus, string[]>;

const sensors = [PointerSensor, KeyboardSensor];

/**
 * Canonical dnd-kit v0.4 multi-list controller. The library handles
 * collision detection, insertion index, and "cards-move-out-of-the-way"
 * animations natively — this hook just snapshots state, calls `move()`
 * on dragover, and flushes the final order plus any status change to
 * the mutation layer on drag end.
 */
export const useTaskDnd = (
  baseItemsByStatus: ItemsByStatus,
  tasksById: Map<string, Task>,
) => {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();
  const { saveOrder, saveStatuses } = useTaskMutations();

  const [items, setItems] = useState<ItemsByStatus>(baseItemsByStatus);
  const [activeId, setActiveId] = useState<string | null>(null);
  const snapshot = useRef<ItemsByStatus>(baseItemsByStatus);
  const startStatusRef = useRef<TaskStatus | null>(null);

  useEffect(() => {
    if (activeId == null) setItems(baseItemsByStatus);
  }, [baseItemsByStatus, activeId]);

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.operation.source?.id ?? "");
      setActiveId(id);
      snapshot.current = items;
      startStatusRef.current = tasksById.get(id)?.status ?? null;
    },
    [items, tasksById],
  );

  const onDragOver = useCallback((event: DragOverEvent) => {
    if (event.operation.source?.type === "column") return;
    setItems((prev) => move(prev, event) as ItemsByStatus);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const startStatus = startStatusRef.current;
      const id = String(event.operation.source?.id ?? "");
      startStatusRef.current = null;
      setActiveId(null);

      if (event.canceled) {
        setItems(snapshot.current);
        return;
      }
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
    [items, slug, eventId, tasksById, queryClient, saveOrder, saveStatuses],
  );

  return { sensors, items, activeId, onDragStart, onDragOver, onDragEnd };
};
