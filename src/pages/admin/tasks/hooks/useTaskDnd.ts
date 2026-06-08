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
import { useCardFly } from "./useCardFly";
import type { Task, TaskStatus } from "../types";

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

// Fractional position for a card landing at `index` within `columnIds`:
// the midpoint of its neighbours, or appended/prepended at the column ends.
// Neighbour positions come from the committed cache (tasksById).
const positionFor = (
  columnIds: string[],
  index: number,
  tasksById: Map<string, Task>,
): number => {
  const prev = tasksById.get(columnIds[index - 1] ?? "")?.position;
  const next = tasksById.get(columnIds[index + 1] ?? "")?.position;

  if (prev != null && next != null) return (prev + next) / 2;
  if (prev != null) return prev + 1000;
  if (next != null) return next / 2;
  return 1000; // empty column
};

export const useTaskDnd = (
  baseItemsByStatus: ItemsByStatus,
  tasksById: Map<string, Task>,
) => {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();
  const { move: moveTask } = useTaskMutations();
  const setDragging = useTaskModalStore((s) => s.setDragging);

  const [items, setItems] = useState<ItemsByStatus>(baseItemsByStatus);
  const [activeId, setActiveId] = useState<string | null>(null);
  const snapshot = useRef<ItemsByStatus>(baseItemsByStatus);
  // Tracks whether onDragOver fired at least once. Prevents a spurious
  // move when the handle is clicked without dragging.
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
    },
    [items, setDragging],
  );

  const onDragOver = useCallback((event: DragOverEvent) => {
    if (event.operation.source?.type === "column") return;
    hasMoved.current = true;
    setItems((prev) => move(prev, event) as ItemsByStatus);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const id = String(event.operation.source?.id ?? "");
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
      if (!endStatus) return;

      const index = items[endStatus].indexOf(id);
      const position = positionFor(items[endStatus], index, tasksById);

      // remember where it sat, so a failed move can revert deterministically
      const before = tasksById.get(id);

      // Optimistic: patch the moved card's status + position; TasksView sorts
      // by position, so the board holds the dropped placement. move.onSuccess
      // reconciles with the server row.
      queryClient.setQueryData<Task[]>(adminKeys.tasks(slug), (prev) =>
        prev?.map((t) =>
          t.id === id ? { ...t, status: endStatus, position } : t,
        ) ?? prev,
      );

      moveTask.mutate(
        { event_id: eventId, id, status: endStatus, position },
        {
          // server rejected: fly the card back from where it was dropped to home
          onError: () => {
            const fly = useCardFly.getState();
            fly.takeOff(id, "destructive");
            if (before) {
              queryClient.setQueryData<Task[]>(adminKeys.tasks(slug), (prev) =>
                prev?.map((t) =>
                  t.id === id
                    ? { ...t, status: before.status, position: before.position }
                    : t,
                ) ?? prev,
              );
            }
            fly.land(id);
          },
        },
      );
    },
    [items, slug, eventId, tasksById, queryClient, moveTask, setDragging],
  );

  return { sensors, items, activeId, onDragStart, onDragOver, onDragEnd };
};
