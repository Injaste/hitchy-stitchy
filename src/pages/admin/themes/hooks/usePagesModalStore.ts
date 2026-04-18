import { create } from "zustand"
import type { EventPage } from "../types"

interface PagesModalState {
  isThemePickerOpen: boolean
  isRenameOpen: boolean
  isDeleteOpen: boolean
  isPublishOpen: boolean
  selectedPage: EventPage | null

  openThemePicker: () => void
  openRename: (page: EventPage) => void
  openDelete: (page: EventPage) => void
  openPublish: (page: EventPage) => void
  closeAll: () => void
}

export const usePagesModalStore = create<PagesModalState>((set) => ({
  isThemePickerOpen: false,
  isRenameOpen: false,
  isDeleteOpen: false,
  isPublishOpen: false,
  selectedPage: null,

  openThemePicker: () => set({ isThemePickerOpen: true }),
  openRename: (page) => set({ isRenameOpen: true, selectedPage: page }),
  openDelete: (page) => set({ isDeleteOpen: true, selectedPage: page }),
  openPublish: (page) => set({ isPublishOpen: true, selectedPage: page }),
  closeAll: () => set({
    isThemePickerOpen: false,
    isRenameOpen: false,
    isDeleteOpen: false,
    isPublishOpen: false,
  }),
}))
