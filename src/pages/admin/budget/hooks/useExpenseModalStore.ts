import { createCrudModalStore } from "../../hooks/modalStoreFactories"
import type { Expense } from "../types"

interface ExpenseModalAddons {
  /** Open the edit modal directly on a row (sets selectedItem + flips flags). */
  openEditItem: (item: Expense) => void
  /** Open the delete confirm directly on a row. */
  openDeleteItem: (item: Expense) => void
  /** Vendor to pre-link, when the create modal was opened from a vendor's
   *  detail rather than the Budget page. Null on the normal Budget flow. */
  createVendorId: string | null
  /** Day to pre-select alongside it. The caller works this out (a vendor knows
   *  its own booked days and the list's filter); this store just carries it. */
  createDayId: string | null
  openCreateForVendor: (vendorId: string, dayId: string | null) => void
  /** Run once when these modals close. Lets a caller that handed off to them
   *  (the vendor detail) send the user back where they came from — without this
   *  store needing to know what a vendor is. */
  onCloseReturn: (() => void) | null
  setOnCloseReturn: (fn: (() => void) | null) => void
  /** The "+ New vendor" dialog opened from the expense form's Vendor field. It
   *  STACKS on top rather than replacing the expense modal — unlike the vendor
   *  detail's hand-off, the caller here is a half-filled form, and closing it to
   *  make room would throw away everything typed so far. */
  isVendorCreateOpen: boolean
  /** Day the expense being written falls on, carried through so the new vendor
   *  is booked for it — same guess the Vendors page makes from its day filter. */
  vendorCreateDayId: string | null
  openVendorCreate: (dayId: string | null) => void
  closeVendorCreate: () => void
  /** A vendor just created from that dialog, waiting to be selected into the
   *  form. The form applies it and clears it — the two live in different modals,
   *  so the store is the only thing they share. */
  pendingVendorId: string | null
  setPendingVendorId: (id: string | null) => void
  extendedCloseAll: () => void
  /** Clears the preset on close (the factory runs this alongside selectedItem),
   *  so the next plain "Add expense" on Budget doesn't inherit a vendor. */
  extendedReset: () => void
}

export const useExpenseModalStore = createCrudModalStore<Expense, ExpenseModalAddons>(
  (set, get) => ({
    openEditItem: (item) =>
      set({
        selectedItem: item,
        isEditOpen: true,
        isDetailOpen: false,
        isDeleteOpen: false,
      }),
    openDeleteItem: (item) =>
      set({ selectedItem: item, isDeleteOpen: true, isEditOpen: false }),
    createVendorId: null,
    createDayId: null,
    openCreateForVendor: (vendorId, dayId) =>
      set({ isCreateOpen: true, createVendorId: vendorId, createDayId: dayId }),
    onCloseReturn: null,
    setOnCloseReturn: (fn) => set({ onCloseReturn: fn }),
    isVendorCreateOpen: false,
    vendorCreateDayId: null,
    openVendorCreate: (dayId) =>
      set({ isVendorCreateOpen: true, vendorCreateDayId: dayId }),
    closeVendorCreate: () =>
      set({ isVendorCreateOpen: false, vendorCreateDayId: null }),
    pendingVendorId: null,
    setPendingVendorId: (id) => set({ pendingVendorId: id }),
    // closeAll runs this immediately after resetting the flags — the one place
    // every close path (save, cancel, dismiss) funnels through.
    extendedCloseAll: () => {
      const back = get().onCloseReturn
      if (!back) return
      set({ onCloseReturn: null })
      back()
    },
    extendedReset: () =>
      set({
        createVendorId: null,
        createDayId: null,
        isVendorCreateOpen: false,
        vendorCreateDayId: null,
        pendingVendorId: null,
      }),
  }),
)
