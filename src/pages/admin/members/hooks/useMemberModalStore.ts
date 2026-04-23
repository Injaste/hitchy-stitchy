import { create } from "zustand"
import type { Member } from "../types"

interface MemberModalState {
  isInviteOpen: boolean
  isDetailOpen: boolean
  isEditOpen: boolean
  isDeleteOpen: boolean
  isFreezeOpen: boolean
  selectedItem: Member | null

  openInvite: () => void
  openDetail: (member: Member) => void
  openDelete: () => void
  openEdit: () => void
  openFreeze: () => void
  closeAll: () => void
}

export const useMemberModalStore = create<MemberModalState>((set) => ({
  isInviteOpen: false,
  isDetailOpen: false,
  isEditOpen: false,
  isDeleteOpen: false,
  isFreezeOpen: false,
  selectedItem: null,

  openInvite: () => set({ isInviteOpen: true }),
  openDetail: (member) => set({ isDetailOpen: true, selectedItem: member }),
  openEdit: () => set({ isDetailOpen: false, isEditOpen: true }),
  openDelete: () => set({ isDetailOpen: false, isDeleteOpen: true }),
  openFreeze: () => set({ isDetailOpen: false, isFreezeOpen: true }),

  closeAll: () =>
    set({
      isInviteOpen: false,
      isDetailOpen: false,
      isEditOpen: false,
      isDeleteOpen: false,
      isFreezeOpen: false,
    }),
}))
