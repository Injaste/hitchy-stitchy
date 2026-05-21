import { create } from "zustand";

import type { TaskStatus } from "../types";

export type DragAnchor =
  | "end"
  | { type: "before" | "after"; id: string };

interface TaskDndState {
  draggingId: string | null;
  draggingHeight: number | null;
  dragOver: { status: TaskStatus; anchor: DragAnchor } | null;
  setDragging: (id: string | null, height?: number | null) => void;
  setDragOver: (over: TaskDndState["dragOver"]) => void;
  reset: () => void;
}

const sameAnchor = (a: DragAnchor, b: DragAnchor): boolean => {
  if (a === "end" || b === "end") return a === b;
  return a.type === b.type && a.id === b.id;
};

const sameDragOver = (
  a: TaskDndState["dragOver"],
  b: TaskDndState["dragOver"],
): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.status === b.status && sameAnchor(a.anchor, b.anchor);
};

export const useTaskDndStore = create<TaskDndState>((set) => ({
  draggingId: null,
  draggingHeight: null,
  dragOver: null,
  setDragging: (id, height) =>
    set({ draggingId: id, draggingHeight: height ?? null }),
  setDragOver: (over) =>
    set((s) => (sameDragOver(s.dragOver, over) ? s : { dragOver: over })),
  reset: () => set({ draggingId: null, draggingHeight: null, dragOver: null }),
}));
