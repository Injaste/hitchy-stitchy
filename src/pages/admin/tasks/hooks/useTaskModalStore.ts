import { createModalStore } from "../../hooks/useModalStore"
import type { Task } from "../types"

interface TaskModalAddons {
  isArchiveOpen: boolean
  archiveTargets: Task[]
  openArchive: (items: Task[]) => void
  isArchivedSheetOpen: boolean
  openArchivedSheet: () => void
  closeArchivedSheet: () => void
  extendedCloseAll: () => void
  extendedReset: () => void
}

export const useTaskModalStore = createModalStore<Task, TaskModalAddons>((set) => ({
  isArchiveOpen: false,
  archiveTargets: [],

  openArchive: (items) => set({ isDetailOpen: false, isArchiveOpen: true, archiveTargets: items }),

  isArchivedSheetOpen: false,
  openArchivedSheet: () => set({ isArchivedSheetOpen: true }),
  closeArchivedSheet: () => set({ isArchivedSheetOpen: false }),

  extendedCloseAll: () => set({ isArchiveOpen: false }),
  extendedReset: () => set({ archiveTargets: [] }),
}))
