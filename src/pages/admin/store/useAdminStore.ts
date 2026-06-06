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

  setContext: (ctx) => set({ ...ctx }),
}));
