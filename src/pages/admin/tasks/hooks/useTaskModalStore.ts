import { createCrudModalStore } from "../../hooks/modalStoreFactories"
import type { Task } from "../types"

interface TaskModalAddons {
  isArchivedSheetOpen: boolean
  openArchivedSheet: () => void
  closeArchivedSheet: () => void
  isDragging: boolean
  setDragging: (v: boolean) => void
}

export const useTaskModalStore = createCrudModalStore<Task, TaskModalAddons>((set) => ({
  isArchivedSheetOpen: false,
  openArchivedSheet: () => set({ isArchivedSheetOpen: true }),
  closeArchivedSheet: () => set({ isArchivedSheetOpen: false }),

  isDragging: false,
  setDragging: (v) => set({ isDragging: v }),
}))
