import { create } from "zustand";

interface ActiveCueModalState {
  isActiveCueModalOpen: boolean;
  openActiveCueModal: () => void;
  closeActiveCueModal: () => void;
}

export const useActiveCueModalStore = create<ActiveCueModalState>((set) => ({
  isActiveCueModalOpen: false,
  openActiveCueModal: () => set({ isActiveCueModalOpen: true }),
  closeActiveCueModal: () => set({ isActiveCueModalOpen: false }),
}));
