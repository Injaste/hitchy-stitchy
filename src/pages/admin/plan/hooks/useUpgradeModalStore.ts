import { create } from "zustand";

interface UpgradeModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/** Open-state for the upgrade modal. A singleton modal triggered across subtrees
 *  (the limit-reached banner in AdminTopbar opens it; AdminView mounts it), so it
 *  rides a tiny store rather than the CRUD createModalStore — mirrors usePingStore. */
export const useUpgradeModalStore = create<UpgradeModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
