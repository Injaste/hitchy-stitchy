import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

import type { Task, TaskStatus } from "./types";

type DragData = {
  type: "task";
  taskId: string;
  status: TaskStatus;
};

type DropTargetData =
  | { type: "task"; taskId: string; status: TaskStatus }
  | { type: "column"; status: TaskStatus };

export const isTaskDragData = (data: Record<string, unknown>): data is DragData =>
  data.type === "task" &&
  typeof data.taskId === "string" &&
  typeof data.status === "string";

export const isDropTargetData = (
  data: Record<string, unknown>,
): data is DropTargetData =>
  (data.type === "task" || data.type === "column") &&
  typeof data.status === "string";

/**
 * Given the current tasks array, the dragged source data, and the drop
 * target data (column or another task), return the new tasks array with
 * the dragged task moved into position. Pure; returns null if no change.
 */
export function computeNextTasks(
  tasks: Task[],
  source: { data: Record<string, unknown> },
  target: { data: Record<string, unknown>; element?: Element },
): Task[] | null {
  if (!isTaskDragData(source.data) || !isDropTargetData(target.data)) {
    return null;
  }

  const sourceId = source.data.taskId;
  const sourceIdx = tasks.findIndex((t) => t.id === sourceId);
  if (sourceIdx === -1) return null;

  const dragged = tasks[sourceIdx];
  const destStatus = target.data.status;
  const withoutSource = tasks.filter((_, i) => i !== sourceIdx);
  const updated: Task = { ...dragged, status: destStatus };

  // Dropped on a column body (not on another card) → append to end of that column.
  if (target.data.type === "column") {
    // Find last index of destStatus in withoutSource; insert right after.
    let insertAt = withoutSource.length;
    for (let i = withoutSource.length - 1; i >= 0; i--) {
      if (withoutSource[i].status === destStatus) {
        insertAt = i + 1;
        break;
      }
      if (withoutSource[i].status !== destStatus && insertAt === withoutSource.length) {
        // keep scanning
      }
    }
    // If no other task in destStatus, prepend to first occurrence of destStatus or end.
    if (insertAt === withoutSource.length) {
      // Look for the natural slot: end of the array works regardless.
      insertAt = withoutSource.length;
    }
    const next = [
      ...withoutSource.slice(0, insertAt),
      updated,
      ...withoutSource.slice(insertAt),
    ];
    return sameOrder(tasks, next) ? null : next;
  }

  // Dropped on another task → insert above or below depending on closest edge.
  const targetId = target.data.taskId;
  const targetIdx = withoutSource.findIndex((t) => t.id === targetId);
  if (targetIdx === -1) return null;

  const edge = extractClosestEdge(target.data);
  const insertAt = edge === "bottom" ? targetIdx + 1 : targetIdx;
  const next = [
    ...withoutSource.slice(0, insertAt),
    updated,
    ...withoutSource.slice(insertAt),
  ];
  return sameOrder(tasks, next) ? null : next;
}

function sameOrder(a: Task[], b: Task[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return false;
    if (a[i].status !== b[i].status) return false;
  }
  return true;
}
