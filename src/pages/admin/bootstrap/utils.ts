import type { RoleCategory } from "../types";

export const isAdminMember = (category: RoleCategory): boolean =>
  category === "root" || category === "admin";
