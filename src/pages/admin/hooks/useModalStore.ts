import { create } from "zustand"

interface ModalState<T> {
  isCreateOpen: boolean
  isEditOpen: boolean
  isDeleteOpen: boolean
  isDetailOpen: boolean
  selectedItem: T | null

  openCreate: () => void
  openEdit: () => void
  openDelete: () => void
  openDetail: (item: T) => void
  closeAll: () => void
}

export function createModalStore<T>() {
  return create<ModalState<T>>((set) => ({
    isCreateOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    isDetailOpen: false,
    selectedItem: null,

    openCreate: () => set({ isCreateOpen: true }),
    openEdit: () => set({ isDetailOpen: false, isEditOpen: true }),
    openDelete: () => set({ isDetailOpen: false, isDeleteOpen: true }),
    openDetail: (item) => set({ isDetailOpen: true, selectedItem: item }),

    closeAll: () => set({
      isCreateOpen: false,
      isEditOpen: false,
      isDeleteOpen: false,
      isDetailOpen: false,
    }),
  }))
}