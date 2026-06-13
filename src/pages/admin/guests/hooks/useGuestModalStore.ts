import { createModalStore } from "../../hooks/useModalStore"
import type { Guest, GuestStatus } from "../types"

interface GuestModalAddons {
  isImportOpen: boolean
  isBulkUpdateOpen: boolean
  selectedIds: Set<string>
  bulkUpdateIds: string[]
  bulkUpdateStatus: GuestStatus | null

  openImport: () => void
  openBulkUpdate: (ids: string[], status: GuestStatus) => void
  toggleRow: (id: string) => void
  setSelectedIds: (ids: Set<string>) => void
  clearSelection: () => void
  extendedCloseAll: () => void
  extendedReset: () => void
}

export const useGuestModalStore = createModalStore<Guest, GuestModalAddons>((set, get) => ({
  isImportOpen: false,
  isBulkUpdateOpen: false,
  selectedIds: new Set(),
  bulkUpdateIds: [],
  bulkUpdateStatus: null,

  openImport: () => set({ isImportOpen: true }),
  openBulkUpdate: (ids, status) =>
    set({ isBulkUpdateOpen: true, bulkUpdateIds: ids, bulkUpdateStatus: status }),

  toggleRow: (id) => {
    const next = new Set((get() as { selectedIds: Set<string> }).selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({ selectedIds: next })
  },
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: new Set() }),

  extendedCloseAll: () => set({ isImportOpen: false, isBulkUpdateOpen: false }),
  // Runs on *every* closeAll, so it must only reset the transient bulk-modal
  // inputs — never the row selection, which has to survive opening/closing a
  // guest's detail, edit, or create modal. Selection is cleared explicitly at
  // the call sites that consume it (bulk update success, delete).
  extendedReset: () =>
    set({
      bulkUpdateIds: [],
      bulkUpdateStatus: null,
    }),
}))
