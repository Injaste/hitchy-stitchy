import { createCrudModalStore } from "../../hooks/modalStoreFactories"
import type { Guest } from "../types"

interface GuestModalAddons {
  // Copy an existing guest onto other invitation pages (selectedItem is the source).
  isDuplicateOpen: boolean
  selectedIds: Set<string>
  // Segment (invitation page) the list is focused on, within the active day.
  // null = "All" pages of the day. Drives both the list filter and the page the
  // create modal pre-targets. Reset to null whenever the active day changes.
  activeInvitationId: string | null
  // Ids GuestDeleteModal targets. Empty for a single-row delete (selectedItem
  // is the target); populated for a bulk delete (one or more rows).
  deleteIds: string[]
  // Paste/CSV import of a whole list onto one or more pages.
  isImportOpen: boolean
  // Add the selected guests to other invitation pages (additive by default).
  // Held as whole guests, not ids: a move deletes their current rows, and the
  // sheet is still on screen when that lands.
  isBulkPagesOpen: boolean
  bulkPagesGuests: Guest[]

  setActiveInvitationId: (id: string | null) => void
  openDuplicate: () => void
  openDelete: () => void
  // `single` is the guest when exactly one row is selected — held as a snapshot
  // so the dialog's copy survives its own success (see openBulkDelete below).
  openBulkDelete: (ids: string[], single?: Guest | null) => void
  openImport: () => void
  openBulkPages: (guests: Guest[]) => void
  toggleRow: (id: string) => void
  setSelectedIds: (ids: Set<string>) => void
  clearSelection: () => void
  extendedCloseAll: () => void
  extendedReset: () => void
}

export const useGuestModalStore = createCrudModalStore<Guest, GuestModalAddons>((set, get) => ({
  isDuplicateOpen: false,
  selectedIds: new Set(),
  activeInvitationId: null,
  deleteIds: [],
  isImportOpen: false,
  isBulkPagesOpen: false,
  bulkPagesGuests: [],

  setActiveInvitationId: (id) => set({ activeInvitationId: id }),
  openDuplicate: () => set({ isDetailOpen: false, isDuplicateOpen: true }),
  openDelete: () => set({ isDetailOpen: false, isDeleteOpen: true, deleteIds: [] }),
  // Snapshot the guest on a 1-row selection so GuestDeleteModal reads its name
  // from the store, not the live list — the delete empties the list row before
  // the dialog has finished closing, which would blank the name mid-fade.
  openBulkDelete: (ids, single) =>
    set({
      isDeleteOpen: true,
      deleteIds: ids,
      ...(single ? { selectedItem: single } : {}),
    }),
  openImport: () => set({ isImportOpen: true }),
  openBulkPages: (guests) =>
    set({ isBulkPagesOpen: true, bulkPagesGuests: guests }),

  toggleRow: (id) => {
    const next = new Set((get() as { selectedIds: Set<string> }).selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({ selectedIds: next })
  },
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: new Set() }),

  extendedCloseAll: () =>
    set({
      isDuplicateOpen: false,
      isImportOpen: false,
      isBulkPagesOpen: false,
    }),
  extendedReset: () => set({ deleteIds: [], bulkPagesGuests: [] }),
}))
