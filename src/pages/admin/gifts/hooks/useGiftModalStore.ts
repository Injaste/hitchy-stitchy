import { createModalStore } from "../../hooks/useModalStore"
import type { Gift } from "../types"

interface GiftModalAddons {
  /** Open the edit modal directly on a row. */
  openEditItem: (item: Gift) => void
  /** Open the delete confirm directly on a row. */
  openDeleteItem: (item: Gift) => void
}

export const useGiftModalStore = createModalStore<Gift, GiftModalAddons>(
  (set) => ({
    openEditItem: (item) =>
      set({
        selectedItem: item,
        isEditOpen: true,
        isDetailOpen: false,
        isDeleteOpen: false,
      }),
    openDeleteItem: (item) =>
      set({ selectedItem: item, isDeleteOpen: true, isEditOpen: false }),
  }),
)
