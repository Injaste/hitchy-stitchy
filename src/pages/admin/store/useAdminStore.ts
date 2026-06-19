import { create } from "zustand";
import type { AdminBootstrapContext } from "../types";

interface AdminState extends AdminBootstrapContext {
  setContext: (ctx: AdminBootstrapContext) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  slug: "",
  eventId: "",
  eventName: "",
  dateStart: "",
  dateEnd: "",
  memberId: "",
  memberDisplayName: "",
  memberAccessGroupId: "",
  memberAccessGroupName: "",
  isRoot: false,
  permissions: {},
  memberRole: null,
  isBride: false,
  isGroom: false,
  isSuperAdmin: false,
  plan: {
    key: "free",
    tier: "free",
    name: "Free",
    activatedAt: null,
    isOver: false,
    limits: {
      maxDays: 1,
      maxSegmentsPerDay: 3,
      maxInvitationPages: 1,
      maxGuests: 500,
      maxMembers: 3,
      canUseBudget: false,
      canUseGifts: false,
      canRemoveBranding: false,
    },
    usage: { days: 0, guests: 0, members: 0, pages: 0 },
  },

  setContext: (ctx) => set({ ...ctx }),
}));
