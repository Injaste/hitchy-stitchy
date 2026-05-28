import type { RoleCategory } from "../types";

export const isAdminMember = (category: RoleCategory): boolean =>
  category === "root" || category === "admin";

export const isBrideOrGroom = (roleName: string): boolean =>
  /^(bride|groom)$/i.test(roleName);
