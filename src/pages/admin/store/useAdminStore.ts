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
    isOverPlanLimits: false,
    // Neutral placeholders until bootstrap fills the real plan — don't duplicate
    // the DB seed caps here (they'd drift from `plans`). The admin shell only
    // renders once bootstrap has resolved, so these are never shown.
    limits: {
      maxDays: 0,
      maxSegmentsPerDay: 0,
      maxInvitationPages: 0,
      maxGuests: 0,
      maxMembers: 0,
      canUseBudget: false,
      canUseGifts: false,
      canRemoveBranding: false,
    },
    usage: { days: 0, guests: 0, members: 0, pages: 0 },
  },

  setContext: (ctx) => set({ ...ctx }),
}));
