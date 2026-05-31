import { create } from "zustand";

interface ModalState<T> {
  isCreateOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  isDetailOpen: boolean;
  selectedItem: T | null;
  isCreateMore: boolean;

  openCreate: () => void;
  openEdit: () => void;
  openDelete: () => void;
  openDetail: (item: T) => void;
  setIsCreateMore: (v: boolean) => void;
  closeAll: () => void;

  // Optional hooks contributed by additionalState — extend close behaviour
  // without redefining closeAll. extendedCloseAll runs immediately alongside
  // the base flag reset; extendedReset runs after 200ms alongside selectedItem.
  extendedCloseAll?: () => void;
  extendedReset?: () => void;
}

export function createModalStore<T, U extends object = {}>(
  additionalState?: (set: (partial: any) => void, get: () => any) => U,
) {
  return create<ModalState<T> & U>(
    (set, get) =>
      ({
        isCreateOpen: false,
        isEditOpen: false,
        isDeleteOpen: false,
        isDetailOpen: false,
        selectedItem: null,
        isCreateMore: false,

        openCreate: () =>
          set({ isCreateOpen: true } as Partial<ModalState<T> & U>),
        openEdit: () =>
          set({ isDetailOpen: false, isEditOpen: true } as Partial<
            ModalState<T> & U
          >),
        openDelete: () =>
          set({ isDetailOpen: false, isDeleteOpen: true } as Partial<
            ModalState<T> & U
          >),
        openDetail: (item) =>
          set({ isDetailOpen: true, selectedItem: item } as Partial<
            ModalState<T> & U
          >),
        setIsCreateMore: (v) =>
          set({ isCreateMore: v } as Partial<ModalState<T> & U>),

        closeAll: () => {
          set({
            isCreateOpen: false,
            isEditOpen: false,
            isDeleteOpen: false,
            isDetailOpen: false,
            isCreateMore: false,
          } as Partial<ModalState<T> & U>);
          get().extendedCloseAll?.();
          setTimeout(() => {
            set({ selectedItem: null } as Partial<ModalState<T> & U>);
            get().extendedReset?.();
          }, 200);
        },

        ...(additionalState ? additionalState(set, get) : {}),
      }) as ModalState<T> & U,
  );
}
