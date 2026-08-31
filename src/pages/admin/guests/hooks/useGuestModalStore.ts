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
  isBulkDeleteOpen: boolean
  bulkDeleteIds: string[]
  // Paste/CSV import of a whole list onto one or more pages.
  isImportOpen: boolean

  setActiveInvitationId: (id: string | null) => void
  openDuplicate: () => void
  openBulkDelete: (ids: string[]) => void
  openImport: () => void
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
  isBulkDeleteOpen: false,
  bulkDeleteIds: [],
  isImportOpen: false,

  setActiveInvitationId: (id) => set({ activeInvitationId: id }),
  openDuplicate: () => set({ isDetailOpen: false, isDuplicateOpen: true }),
  openBulkDelete: (ids) => set({ isBulkDeleteOpen: true, bulkDeleteIds: ids }),
  openImport: () => set({ isImportOpen: true }),

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
      isBulkDeleteOpen: false,
      isImportOpen: false,
    }),
  extendedReset: () => set({ bulkDeleteIds: [] }),
}))
