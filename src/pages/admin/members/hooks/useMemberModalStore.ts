import { createModalStore } from "../../hooks/useModalStore"
import type { Member } from "../types"

interface MemberModalAddons {
  isFreezeOpen: boolean
  openFreeze: () => void
  closeAll: () => void
}

export const useMemberModalStore = createModalStore<Member, MemberModalAddons>((set) => ({
  isFreezeOpen: false,

  openFreeze: () => set({ isDetailOpen: false, isFreezeOpen: true }),

  closeAll: () => set({
    isCreateOpen: false,
    isDetailOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    isFreezeOpen: false,
  }),
}))
