import { create } from "zustand";
import type { AdminBootstrapContext } from "../types";

interface AdminState extends AdminBootstrapContext {
  isBootstrapped: boolean;
  bootstrapError: string | null;
  setContext: (ctx: AdminBootstrapContext) => void;
  setBootstrapError: (msg: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  slug: "",
  eventId: "",
  eventName: "",
  dateStart: "",
  dateEnd: "",
  memberId: "",
  memberDisplayName: "",
  memberRoleId: "",
  memberRoleName: "",
  isRoot: false,
  permissions: {},
  memberLabel: null,
  isBride: false,
  isGroom: false,
  isSuperAdmin: false,
  isBootstrapped: false,
  bootstrapError: null,

  setContext: (ctx) =>
    set({
      ...ctx,
      isBootstrapped: true,
      bootstrapError: null,
    }),

  setBootstrapError: (msg) =>
    set({ bootstrapError: msg, isBootstrapped: false }),
}));
