import { create } from "zustand"
import type { Guest } from "../types"

interface GuestModalState {
  isCreateOpen: boolean
  isEditOpen: boolean
  isDeleteOpen: boolean
  isDetailOpen: boolean
  isImportOpen: boolean
  isCreateMore: boolean
  selectedItem: Guest | null

  openCreate: () => void
  openEdit: () => void
  openDelete: () => void
  openDetail: (item: Guest) => void
  openImport: () => void
  setIsCreateMore: (v: boolean) => void
  closeAll: () => void
}

// Bespoke store (not via createModalStore) — guests has an extra isImportOpen
// flag for the CSV import wizard that the shared factory doesn't cover.
export const useGuestModalStore = create<GuestModalState>((set) => ({
  isCreateOpen: false,
  isEditOpen: false,
  isDeleteOpen: false,
  isDetailOpen: false,
  isImportOpen: false,
  isCreateMore: false,
  selectedItem: null,

  openCreate: () => set({ isCreateOpen: true }),
  openEdit: () => set({ isDetailOpen: false, isEditOpen: true }),
  openDelete: () => set({ isDetailOpen: false, isDeleteOpen: true }),
  openDetail: (item) => set({ isDetailOpen: true, selectedItem: item }),
  openImport: () => set({ isImportOpen: true }),
  setIsCreateMore: (v) => set({ isCreateMore: v }),

  closeAll: () =>
    set({
      isCreateOpen: false,
      isEditOpen: false,
      isDeleteOpen: false,
      isDetailOpen: false,
      isImportOpen: false,
    }),
}))
