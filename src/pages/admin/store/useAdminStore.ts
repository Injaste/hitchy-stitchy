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
    key: "solo_1_v1",
    tier: "solo_1",
    name: "Starter",
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
      maxGifts: 0,
      maxExpenses: 0,
      maxTimelineItems: 0,
      maxTasks: 0,
    },
    features: {
      timeline: false,
      timeline_liverun: false,
      tasks: false,
      members: false,
      access: false,
      guests: false,
      budget: false,
      gifts: false,
      vendors: false,
      invitation: false,
      branding: false,
    },
    usage: { days: 0, guests: 0, members: 0, pages: 0, timeline_items: 0, tasks: 0 },
  },
  // Tier ladder is DB-driven (bootstrap fills it); empty until then.
  catalog: [],

  setContext: (ctx) => set({ ...ctx }),
}));
