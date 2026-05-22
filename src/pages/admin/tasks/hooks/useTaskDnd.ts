import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { adminKeys } from "@/pages/admin/lib/queryKeys";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { useTaskMutations } from "../queries";
import type { Task, TaskOrder, TaskStatus } from "../types";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
const isContainerId = (id: UniqueIdentifier): id is TaskStatus =>
  STATUSES.includes(id as TaskStatus);

export type ItemsByStatus = Record<TaskStatus, string[]>;

/**
 * dnd-kit multi-container hook — canonical pattern from the dnd-kit
 * MultipleContainers story, adapted to our React Query cache.
 *
 * State strategy:
 *   - `items` is local React state. While a drag is active, it is the
 *     source of truth for what each column contains (so the visual
 *     position the user sees matches exactly).
 *   - The React Query cache is left alone during the drag. We commit
 *     the final `items` to `taskOrder` (and the moved task's status to
 *     `tasks`) only on drop.
 *
 * This is what makes drop-position match the projected position: we
 * never re-derive `items` from the cache mid-drag.
 */
export function useTaskDnd(
  baseItemsByStatus: ItemsByStatus,
  tasksById: Map<string, Task>,
) {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();
  const { saveOrder, saveStatuses } = useTaskMutations();

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [items, setItems] = useState<ItemsByStatus>(baseItemsByStatus);
  const clonedItems = useRef<ItemsByStatus | null>(null);
  const startStatusRef = useRef<TaskStatus | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Effective items the consumer sees:
  //   - When a drag is active, return the local items state.
  //   - Otherwise return the freshly-derived base from props (cache).
  const effectiveItems = activeId != null ? items : baseItemsByStatus;

  const findContainer = useCallback(
    (id: UniqueIdentifier): TaskStatus | null => {
      if (isContainerId(id)) return id;
      for (const status of STATUSES) {
        if (effectiveItems[status].includes(id as string)) return status;
      }
      return null;
    },
    [effectiveItems],
  );

  /* ─────────────────── collision detection ─────────────────── */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // (We never drag a container itself, but the canonical example
      // handles it; preserved for completeness.)
      if (activeId != null && isContainerId(activeId)) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((c) =>
            isContainerId(c.id),
          ),
        });
      }

      // Pointer-first — most accurate when the pointer is literally
      // inside a droppable. Fall back to rect intersection.
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        // If the first collision is a column, narrow to the closest
        // card inside that column so the insertion slot is precise.
        if (isContainerId(overId)) {
          const containerItems = effectiveItems[overId];
          if (containerItems.length > 0) {
            overId =
              closestCenter({
                ...args,
                droppableContainers: args.droppableContainers.filter(
                  (c) =>
                    c.id !== overId && containerItems.includes(c.id as string),
                ),
              })[0]?.id ?? overId;
          }
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // After a cross-container move, the layout briefly shifts and
      // `over` can be null. Pin to the active id so the next pointer
      // event has a stable reference.
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, effectiveItems],
  );

  // Clear recentlyMovedToNewContainer on the next animation frame after
  // every `items` change.
  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  /* ─────────────────── handlers ─────────────────── */

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    setItems(baseItemsByStatus);
    clonedItems.current = baseItemsByStatus;
    const t = tasksById.get(event.active.id as string);
    startStatusRef.current = t?.status ?? null;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;
    if (overId == null || isContainerId(active.id)) return;

    setItems((items) => {
      const activeContainer =
        (Object.keys(items) as TaskStatus[]).find((s) =>
          items[s].includes(active.id as string),
        ) ?? null;
      const overContainer = isContainerId(overId)
        ? (overId as TaskStatus)
        : (Object.keys(items) as TaskStatus[]).find((s) =>
            items[s].includes(overId as string),
          ) ?? null;

      if (!activeContainer || !overContainer) return items;
      // Same column — leave the visual shift to SortableContext's own
      // per-card transforms. No state write per pointer event.
      if (activeContainer === overContainer) return items;

      const overItems = items[overContainer];
      const overIndex = overItems.indexOf(overId as string);

      let newIndex: number;
      if (isContainerId(overId)) {
        newIndex = overItems.length;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
            over.rect.top + over.rect.height / 2;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
      }

      recentlyMovedToNewContainer.current = true;

      return {
        ...items,
        [activeContainer]: items[activeContainer].filter(
          (id) => id !== active.id,
        ),
        [overContainer]: [
          ...items[overContainer].slice(0, newIndex),
          active.id as string,
          ...items[overContainer].slice(newIndex, items[overContainer].length),
        ],
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const startStatus = startStatusRef.current;
    startStatusRef.current = null;
    clonedItems.current = null;

    if (!over || !slug || !eventId || isContainerId(active.id)) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    // Same-container reorder: arrayMove on the local items state.
    let finalItems = items;
    if (activeContainer === overContainer && active.id !== over.id) {
      const activeIdx = items[activeContainer].indexOf(active.id as string);
      const overIdx = items[overContainer].indexOf(over.id as string);
      if (activeIdx >= 0 && overIdx >= 0 && activeIdx !== overIdx) {
        finalItems = {
          ...items,
          [overContainer]: arrayMove(items[overContainer], activeIdx, overIdx),
        };
        setItems(finalItems);
      }
    }

    // Commit final ordering to the TaskOrder cache.
    const finalTaskOrder: TaskOrder = {
      event_id: eventId,
      todo: finalItems.todo,
      in_progress: finalItems.in_progress,
      done: finalItems.done,
    };
    queryClient.setQueryData<TaskOrder>(
      adminKeys.taskOrder(slug),
      finalTaskOrder,
    );

    // If the column changed, update the task's status in the Task[]
    // cache and fire the saveStatuses mutation.
    const moved = tasksById.get(active.id as string);
    if (moved && startStatus && startStatus !== overContainer) {
      queryClient.setQueryData<Task[]>(adminKeys.tasks(slug), (prev) => {
        if (!prev) return prev;
        return prev.map((t) =>
          t.id === active.id ? { ...t, status: overContainer } : t,
        );
      });
      saveStatuses.mutate({
        event_id: eventId,
        id: moved.id,
        title: moved.title,
        details: moved.details,
        label: moved.label,
        status: overContainer,
        priority: moved.priority,
        due_at: moved.due_at,
        assignees: moved.assignees,
      });
    }

    saveOrder.mutate(finalTaskOrder);
    setActiveId(null);
  };

  const handleDragCancel = () => {
    if (clonedItems.current) {
      setItems(clonedItems.current);
    }
    clonedItems.current = null;
    startStatusRef.current = null;
    setActiveId(null);
  };

  return {
    sensors,
    activeId,
    items: effectiveItems,
    collisionDetectionStrategy,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
