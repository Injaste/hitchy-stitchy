import { createModalStore } from "../../hooks/useModalStore"
import type { Member } from "../types"

interface MemberModalAddons {
  isFreezeOpen: boolean
  openFreeze: () => void
  extendedCloseAll: () => void
}

export const useMemberModalStore = createModalStore<Member, MemberModalAddons>((set) => ({
  isFreezeOpen: false,

  openFreeze: () => set({ isDetailOpen: false, isFreezeOpen: true }),

  extendedCloseAll: () => set({ isFreezeOpen: false }),
}))
