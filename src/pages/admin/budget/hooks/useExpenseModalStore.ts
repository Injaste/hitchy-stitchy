import { createModalStore } from "../../hooks/useModalStore"
import type { Expense } from "../types"

interface ExpenseModalAddons {
  /** Open the edit modal directly on a row (sets selectedItem + flips flags). */
  openEditItem: (item: Expense) => void
  /** Open the delete confirm directly on a row. */
  openDeleteItem: (item: Expense) => void
}

export const useExpenseModalStore = createModalStore<Expense, ExpenseModalAddons>(
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
