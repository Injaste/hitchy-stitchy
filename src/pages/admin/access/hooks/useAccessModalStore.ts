import { createModalStore } from "../../hooks/useModalStore";
import type { AccessGroup } from "../types";

interface AccessModalAdditional {
  openDeleteAccessGroup: (group: AccessGroup) => void;
}

export const useAccessModalStore = createModalStore<AccessGroup, AccessModalAdditional>(
  (set) => ({
    openDeleteAccessGroup: (group) => set({ selectedItem: group, isDeleteOpen: true }),
  }),
);
