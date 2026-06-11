import { createModalStore } from "../../hooks/useModalStore"
import type { Member } from "../types"

interface MemberModalAddons {
  isFreezeOpen: boolean
  openFreeze: () => void
  extendedCloseAll: () => void
  /** Hand off from the invite form to the new member's detail panel (which shows
   *  the share link). Closes the create modal and opens detail in one set. */
  openDetailForInvited: (member: Member) => void
}

export const useMemberModalStore = createModalStore<Member, MemberModalAddons>((set) => ({
  isFreezeOpen: false,

  openFreeze: () => set({ isDetailOpen: false, isFreezeOpen: true }),

  extendedCloseAll: () => set({ isFreezeOpen: false }),

  openDetailForInvited: (member) =>
    set({ isCreateOpen: false, isDetailOpen: true, selectedItem: member }),
}))
