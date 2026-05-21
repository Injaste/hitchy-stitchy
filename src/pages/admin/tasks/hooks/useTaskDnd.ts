import { useEffect, useRef, type RefObject } from "react";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

import { useTaskReorder } from "../queries";
import type { Task, TaskStatus } from "../types";
import { isTaskDragData, isDropTargetData } from "../utils-dnd";
import { useTaskDndStore, type DragAnchor } from "./useTaskDndStore";

/* ─────────────────────────── Global monitor ─────────────────────────── */

/**
 * Subscribes once to pragmatic's element monitor. Routes drop events
 * into useTaskReorder (which owns all cache writes), and updates the
 * DnD store on every drag transition so cards can show the dotted
 * placeholder at the projected drop position.
 *
 * `reorder` is held in a ref so re-subscribe never fires mid-drag.
 */
export function useTaskMonitor() {
  const reorder = useTaskReorder();
  const reorderRef = useRef(reorder);
  reorderRef.current = reorder;

  useEffect(() => {
    const { setDragOver, reset } = useTaskDndStore.getState();

    return combine(
      monitorForElements({
        canMonitor: ({ source }) => isTaskDragData(source.data),
        onDrag({ source, location }) {
          if (!isTaskDragData(source.data)) return;
          const target = location.current.dropTargets[0];
          if (!target || !isDropTargetData(target.data)) {
            setDragOver(null);
            return;
          }
          // Hovering over the source card itself — no placeholder.
          if (
            target.data.type === "task" &&
            target.data.taskId === source.data.taskId
          ) {
            setDragOver(null);
            return;
          }
          let anchor: DragAnchor;
          if (target.data.type === "column") {
            anchor = "end";
          } else {
            const edge = extractClosestEdge(target.data);
            anchor = {
              type: edge === "top" ? "before" : "after",
              id: target.data.taskId,
            };
          }
          setDragOver({ status: target.data.status, anchor });
        },
        onDrop({ source, location }) {
          reset();
          if (!isTaskDragData(source.data)) return;
          const target = location.current.dropTargets[0];
          if (!target) return;
          reorderRef.current(source, target);
        },
      }),
    );
  }, []);
}

/* ─────────────────────────── Per-card adapter ─────────────────────────── */

/**
 * Register a task card element as both draggable AND a drop target
 * (so dropping on top of another card uses closest-edge to decide
 * above vs. below). All visual state lives in the DnD store — this
 * hook only wires up the pragmatic adapters.
 */
export function useTaskCardDnd(
  ref: RefObject<HTMLElement | null>,
  task: Task,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const data = { type: "task" as const, taskId: task.id, status: task.status };
    const { setDragging } = useTaskDndStore.getState();

    return combine(
      draggable({
        element: el,
        getInitialData: () => data,
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({ x: "12px", y: "8px" }),
            render({ container }) {
              const clone = el.cloneNode(true) as HTMLElement;
              clone.style.width = `${el.offsetWidth}px`;
              clone.style.transform = "rotate(1.2deg)";
              clone.style.boxShadow = "0 12px 40px rgba(0,0,0,0.18)";
              clone.style.pointerEvents = "none";
              container.appendChild(clone);
            },
          });
        },
        onDragStart() {
          setDragging(task.id, el.offsetHeight);
        },
        onDrop() {
          setDragging(null, null);
        },
      }),
      dropTargetForElements({
        element: el,
        canDrop: ({ source }) =>
          isTaskDragData(source.data) && source.data.taskId !== task.id,
        getData: ({ input, element }) =>
          attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ["top", "bottom"],
          }),
      }),
    );
  }, [ref, task.id, task.status]);
}

/* ─────────────────────────── Per-column adapter ─────────────────────────── */

/**
 * Register a column scroll body as a drop target. Used so dropping into
 * empty space (not on top of a task card) still routes correctly.
 */
export function useTaskColumnDrop(
  ref: RefObject<HTMLElement | null>,
  status: TaskStatus,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => isTaskDragData(source.data),
      getData: () => ({ type: "column" as const, status }),
    });
  }, [ref, status]);
}

/* ─────────────────────────── Card selectors ─────────────────────────── */

const matchesDragOverBefore = (
  dragOver: ReturnType<typeof useTaskDndStore.getState>["dragOver"],
  id: string,
) =>
  !!dragOver &&
  dragOver.anchor !== "end" &&
  dragOver.anchor.type === "before" &&
  dragOver.anchor.id === id;

const matchesDragOverAfter = (
  dragOver: ReturnType<typeof useTaskDndStore.getState>["dragOver"],
  id: string,
) =>
  !!dragOver &&
  dragOver.anchor !== "end" &&
  dragOver.anchor.type === "after" &&
  dragOver.anchor.id === id;

const matchesDragOverEnd = (
  dragOver: ReturnType<typeof useTaskDndStore.getState>["dragOver"],
  status: TaskStatus,
) => !!dragOver && dragOver.anchor === "end" && dragOver.status === status;

export const useIsTaskDragging = (id: string) =>
  useTaskDndStore((s) => s.draggingId === id);

export const useTaskGhostAbove = (id: string) =>
  useTaskDndStore((s) => matchesDragOverBefore(s.dragOver, id));

export const useTaskGhostBelow = (id: string) =>
  useTaskDndStore((s) => matchesDragOverAfter(s.dragOver, id));

export const useColumnEndGhost = (status: TaskStatus) =>
  useTaskDndStore((s) => matchesDragOverEnd(s.dragOver, status));

export const useColumnIsDragOver = (status: TaskStatus) =>
  useTaskDndStore((s) => s.dragOver?.status === status);

export const useDraggingHeight = () =>
  useTaskDndStore((s) => s.draggingHeight);
