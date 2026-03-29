import { create } from "zustand";
import type { ChecklistItem } from "@/pages/admin/features/operations/checklist/types";

interface ChecklistModalState {
  isTaskModalOpen: boolean;
  editingTask: ChecklistItem | null;

  isConfirmDeleteTaskModalOpen: boolean;
  taskToDelete: string | null;

  openTaskModal: (task?: ChecklistItem) => void;
  closeTaskModal: () => void;

  openConfirmDeleteTask: (id: string) => void;
  closeConfirmDeleteTask: () => void;
}

export const useChecklistModalStore = create<ChecklistModalState>((set) => ({
  isTaskModalOpen: false,
  editingTask: null,

  isConfirmDeleteTaskModalOpen: false,
  taskToDelete: null,

  openTaskModal: (task) =>
    set({ isTaskModalOpen: true, editingTask: task ?? null }),
  closeTaskModal: () =>
    set({ isTaskModalOpen: false, editingTask: null }),

  openConfirmDeleteTask: (id) =>
    set({ isConfirmDeleteTaskModalOpen: true, taskToDelete: id }),
  closeConfirmDeleteTask: () =>
    set({ isConfirmDeleteTaskModalOpen: false, taskToDelete: null }),
}));
