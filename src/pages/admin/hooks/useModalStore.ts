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

export function createModalStore<T, U extends object = {}>(
  additionalState?: (
    set: (partial: any) => void,
    get: () => any
  ) => U
) {

  return create<ModalState<T> & U>((set, get) => ({
    isCreateOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    isDetailOpen: false,
    selectedItem: null,

    openCreate: () => set({ isCreateOpen: true } as Partial<ModalState<T> & U>),
    openEdit: () => set({ isDetailOpen: false, isEditOpen: true } as Partial<ModalState<T> & U>),
    openDelete: () => set({ isDetailOpen: false, isDeleteOpen: true } as Partial<ModalState<T> & U>),
    openDetail: (item) => set({ isDetailOpen: true, selectedItem: item } as Partial<ModalState<T> & U>),

    closeAll: () => set({
      isCreateOpen: false,
      isEditOpen: false,
      isDeleteOpen: false,
      isDetailOpen: false,
      selectedItem: null,
    } as Partial<ModalState<T> & U>),

    ...(additionalState ? additionalState(set, get) : {}),
  } as ModalState<T> & U))
}