import { createModalStore } from "../../hooks/useModalStore"
import type { Task } from "../types"

interface TaskModalAddons {
  isArchiveOpen: boolean
  archiveTargets: Task[]
  openArchive: (items: Task[]) => void
  isArchivedSheetOpen: boolean
  openArchivedSheet: () => void
  closeArchivedSheet: () => void
  closeAll: () => void
}

export const useTaskModalStore = createModalStore<Task, TaskModalAddons>((set) => ({
  isArchiveOpen: false,
  archiveTargets: [],

  openArchive: (items) => set({ isDetailOpen: false, isArchiveOpen: true, archiveTargets: items }),

  isArchivedSheetOpen: false,
  openArchivedSheet: () => set({ isArchivedSheetOpen: true }),
  closeArchivedSheet: () => set({ isArchivedSheetOpen: false }),

  closeAll: () => set({
    isCreateOpen: false,
    isDetailOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    isArchiveOpen: false,
    archiveTargets: [],
  }),
}))
