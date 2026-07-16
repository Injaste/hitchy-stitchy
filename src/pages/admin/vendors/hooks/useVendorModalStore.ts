import { createCrudModalStore } from "../../hooks/modalStoreFactories"
import type { Vendor } from "../types"

interface VendorModalAddons {
  /** Open the edit modal directly on a row. */
  openEditItem: (item: Vendor) => void
  /** Open the delete confirm directly on a row. */
  openDeleteItem: (item: Vendor) => void
}

export const useVendorModalStore = createCrudModalStore<Vendor, VendorModalAddons>(
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
