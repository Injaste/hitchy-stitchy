import { create } from "zustand"
import type { Theme } from "../themes/types"

interface ThemesModalState {
  isRenameOpen: boolean
  isDeleteOpen: boolean
  isPublishOpen: boolean
  selectedTheme: Theme | null

  openRename: (theme: Theme) => void
  openDelete: (theme: Theme) => void
  openPublish: (theme: Theme) => void
  closeAll: () => void
}

export const useThemesModalStore = create<ThemesModalState>((set) => ({
  isRenameOpen: false,
  isDeleteOpen: false,
  isPublishOpen: false,
  selectedTheme: null,

  openRename: (theme) => set({ isRenameOpen: true, selectedTheme: theme }),
  openDelete: (theme) => set({ isDeleteOpen: true, selectedTheme: theme }),
  openPublish: (theme) => set({ isPublishOpen: true, selectedTheme: theme }),
  closeAll: () => set({
    isRenameOpen: false,
    isDeleteOpen: false,
    isPublishOpen: false,
  }),
}))
