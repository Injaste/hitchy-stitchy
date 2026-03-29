import { create } from "zustand";

interface PingModalState {
  isPingModalOpen: boolean;
  pingTargetRole: string | null;
  openPingModal: (role?: string) => void;
  closePingModal: () => void;
}

export const usePingModalStore = create<PingModalState>((set) => ({
  isPingModalOpen: false,
  pingTargetRole: null,
  openPingModal: (role) =>
    set({ isPingModalOpen: true, pingTargetRole: role ?? null }),
  closePingModal: () =>
    set({ isPingModalOpen: false, pingTargetRole: null }),
}));
