import { create } from "zustand";

// Shared shape for a settings overlay (account, event, …): open it imperatively
// from anywhere via open("section"). `section` is undefined when opened with no
// argument — desktop falls back to the first section, mobile shows the list.
export interface SettingsStore {
  isOpen: boolean;
  section: string | undefined;
  open: (section?: string) => void;
  setSection: (section: string | undefined) => void;
  close: () => void;
}

export const createSettingsStore = () =>
  create<SettingsStore>((set) => ({
    isOpen: false,
    section: undefined,
    open: (section) => set({ isOpen: true, section }),
    setSection: (section) => set({ section }),
    // Reset the active section after the close animation so it always reopens at
    // the first tab (mobile: the list). Deferred (not synchronous) so the panel
    // doesn't visibly swap to tab 0 while the dialog is fading out.
    close: () => {
      set({ isOpen: false });
      setTimeout(() => set({ section: undefined }), 200);
    },
  }));
