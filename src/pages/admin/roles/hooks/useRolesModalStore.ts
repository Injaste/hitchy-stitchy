import { createModalStore } from "../../hooks/useModalStore";
import type { Role } from "../types";

interface RolesModalAdditional {
  openDeleteRole: (role: Role) => void;
}

export const useRolesModalStore = createModalStore<Role, RolesModalAdditional>(
  (set) => ({
    openDeleteRole: (role) => set({ selectedItem: role, isDeleteOpen: true }),
  }),
);
