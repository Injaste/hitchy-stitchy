import { create } from "zustand";

interface BespokeModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/** Open-state for the bespoke-request modal. Triggered from the hub's promo card
 *  and mounted by the invitation Hub — a tiny singleton store, mirroring
 *  useUpgradeModalStore. */
export const useBespokeModalStore = create<BespokeModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
