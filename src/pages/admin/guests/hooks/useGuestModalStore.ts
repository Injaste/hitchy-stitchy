import { createModalStore } from "../../hooks/useModalStore"
import type { Guest, GuestStatus } from "../types"

interface GuestModalAddons {
  isBulkUpdateOpen: boolean
  // Copy an existing guest onto other invitation pages (selectedItem is the source).
  isDuplicateOpen: boolean
  selectedIds: Set<string>
  bulkUpdateIds: string[]
  bulkUpdateStatus: GuestStatus | null
  // Segment (invitation page) the list is focused on, within the active day.
  // null = "All" pages of the day. Drives both the list filter and the page the
  // create modal pre-targets. Reset to null whenever the active day changes.
  activeInvitationId: string | null

  setActiveInvitationId: (id: string | null) => void
  openDuplicate: () => void
  openBulkUpdate: (ids: string[], status: GuestStatus) => void
  toggleRow: (id: string) => void
  setSelectedIds: (ids: Set<string>) => void
  clearSelection: () => void
  extendedCloseAll: () => void
  extendedReset: () => void
}

export const useGuestModalStore = createModalStore<Guest, GuestModalAddons>((set, get) => ({
  isBulkUpdateOpen: false,
  isDuplicateOpen: false,
  selectedIds: new Set(),
  bulkUpdateIds: [],
  bulkUpdateStatus: null,
  activeInvitationId: null,

  setActiveInvitationId: (id) => set({ activeInvitationId: id }),
  openDuplicate: () => set({ isDetailOpen: false, isDuplicateOpen: true }),
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

  extendedCloseAll: () => set({ isBulkUpdateOpen: false, isDuplicateOpen: false }),
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
