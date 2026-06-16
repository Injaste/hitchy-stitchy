import { create } from "zustand";

export type InvitationSheetMode = "browse" | "edit";

interface InvitationModalState {
  isOpen: boolean;
  mode: InvitationSheetMode;
  // Small-screen preview sheet. `mounted` renders it (load once); `visible`
  // slides it in/out. Hiding never unmounts, so the preview iframe persists.
  previewMounted: boolean;
  previewVisible: boolean;
  openBrowse: () => void;
  openEdit: () => void;
  openPreview: () => void;
  hidePreview: () => void;
  close: () => void;
}

const FRESH = { previewMounted: false, previewVisible: false };

// One invitation sheet, two modes (browse templates / edit). Mirrors the
// per-feature modal-store convention (useXxxModalStore).
export const useInvitationModalStore = create<InvitationModalState>((set) => ({
  isOpen: false,
  mode: "browse",
  previewMounted: false,
  previewVisible: false,
  openBrowse: () => set({ isOpen: true, mode: "browse", ...FRESH }),
  openEdit: () => set({ isOpen: true, mode: "edit", ...FRESH }),
  // First open mounts it (iframe loads once); thereafter just toggles visibility.
  openPreview: () => set({ previewMounted: true, previewVisible: true }),
  hidePreview: () => set({ previewVisible: false }),
  // Closing the main sheet tears the preview down with it.
  close: () => set({ isOpen: false, ...FRESH }),
}));
