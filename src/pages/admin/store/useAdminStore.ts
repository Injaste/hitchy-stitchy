import { create } from "zustand";
import { type AdminBootstrapContext, type RoleCategory } from "../types";

interface AdminState extends AdminBootstrapContext {
  isBootstrapped: boolean;
  bootstrapError: string | null;
  setContext: (ctx: AdminBootstrapContext) => void;
  setBootstrapError: (msg: string) => void;
}

const isAdminMember = (category: RoleCategory): boolean =>
  category === "root" || category === "admin";

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
  memberRoleShortName: "",
  memberRoleCategory: "general" as RoleCategory,
  isAdmin: false,
  isBootstrapped: false,
  bootstrapError: null,

  setContext: (ctx) =>
    set({
      ...ctx,
      isAdmin: isAdminMember(ctx.memberRoleCategory),
      isBootstrapped: true,
      bootstrapError: null,
    }),

  setBootstrapError: (msg) =>
    set({ bootstrapError: msg, isBootstrapped: false }),
}));
