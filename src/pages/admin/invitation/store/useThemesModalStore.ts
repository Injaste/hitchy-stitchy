import { create } from "zustand"
import type { Themes } from "../themes/types"

interface ThemesModalState {
  isRenameOpen: boolean
  isDeleteOpen: boolean
  isPublishOpen: boolean
  selectedTheme: Themes | null

  openRename: (theme: Themes) => void
  openDelete: (theme: Themes) => void
  openPublish: (theme: Themes) => void
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
