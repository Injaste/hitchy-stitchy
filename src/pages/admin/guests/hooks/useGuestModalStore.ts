import { create } from "zustand"
import type { Guest, GuestStatus } from "../types"

interface GuestModalState {
  isCreateOpen: boolean
  isEditOpen: boolean
  isDeleteOpen: boolean
  isDetailOpen: boolean
  isImportOpen: boolean
  isBulkUpdateOpen: boolean
  isCreateMore: boolean
  selectedItem: Guest | null
  selectedIds: Set<string>
  bulkUpdateIds: string[]
  bulkUpdateStatus: GuestStatus | null

  openCreate: () => void
  openEdit: () => void
  openDelete: () => void
  openDetail: (item: Guest) => void
  openImport: () => void
  openBulkUpdate: (ids: string[], status: GuestStatus) => void
  toggleRow: (id: string) => void
  setSelectedIds: (ids: Set<string>) => void
  clearSelection: () => void
  setIsCreateMore: (v: boolean) => void
  closeAll: () => void
}

// Bespoke store (not via createModalStore) — guests has extra flags for the
// CSV import wizard and bulk status update that the shared factory doesn't cover.
export const useGuestModalStore = create<GuestModalState>((set, get) => ({
  isCreateOpen: false,
  isEditOpen: false,
  isDeleteOpen: false,
  isDetailOpen: false,
  isImportOpen: false,
  isBulkUpdateOpen: false,
  isCreateMore: false,
  selectedItem: null,
  selectedIds: new Set(),
  bulkUpdateIds: [],
  bulkUpdateStatus: null,

  openCreate: () => set({ isCreateOpen: true }),
  openEdit: () => set({ isDetailOpen: false, isEditOpen: true }),
  openDelete: () => set({ isDetailOpen: false, isDeleteOpen: true }),
  openDetail: (item) => set({ isDetailOpen: true, selectedItem: item }),
  openImport: () => set({ isImportOpen: true }),
  openBulkUpdate: (ids, status) =>
    set({ isBulkUpdateOpen: true, bulkUpdateIds: ids, bulkUpdateStatus: status }),

  toggleRow: (id) => {
    const next = new Set(get().selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({ selectedIds: next })
  },
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: new Set() }),

  setIsCreateMore: (v) => set({ isCreateMore: v }),

  closeAll: () => {
    set({
      isCreateOpen: false,
      isEditOpen: false,
      isDeleteOpen: false,
      isDetailOpen: false,
      isImportOpen: false,
      isBulkUpdateOpen: false,
    })
    setTimeout(() => {
      set({
        selectedItem: null,
        selectedIds: new Set(),
        bulkUpdateIds: [],
        bulkUpdateStatus: null,
      })
    }, 200)
  },
}))
