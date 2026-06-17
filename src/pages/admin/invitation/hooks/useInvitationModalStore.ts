import { create } from "zustand";

export type InvitationSheetMode = "browse" | "edit";

// The editor's confirm dialogs (rendered by <InvitationModals>). Open-state lives
// here like every other feature's modal store; the form-coupled actions are
// passed to the modals by EditPanel.
export type InvitationConfirm =
  | "publish"
  | "unpublish"
  | "delete"
  | "reset"
  | "discard";

interface InvitationModalState {
  isOpen: boolean;
  mode: InvitationSheetMode;
  // Which invitation the editor is open for (null in browse mode).
  editingId: string | null;
  // Small-screen preview sheet. `mounted` renders it (load once); `visible`
  // slides it in/out. Hiding never unmounts, so the preview iframe persists.
  previewMounted: boolean;
  previewVisible: boolean;
  // Which confirm dialog is open (null = none).
  confirm: InvitationConfirm | null;
  openBrowse: () => void;
  openEdit: (id: string) => void;
  openPreview: () => void;
  hidePreview: () => void;
  openConfirm: (confirm: InvitationConfirm) => void;
  closeConfirm: () => void;
  close: () => void;
}

const FRESH = {
  editingId: null,
  previewMounted: false,
  previewVisible: false,
  confirm: null,
};

// One invitation sheet, two modes (browse templates / edit a page). Mirrors the
// per-feature modal-store convention (useXxxModalStore).
export const useInvitationModalStore = create<InvitationModalState>((set) => ({
  isOpen: false,
  mode: "browse",
  editingId: null,
  previewMounted: false,
  previewVisible: false,
  confirm: null,
  openBrowse: () => set({ isOpen: true, mode: "browse", ...FRESH }),
  openEdit: (id) => set({ isOpen: true, mode: "edit", ...FRESH, editingId: id }),
  // First open mounts it (iframe loads once); thereafter just toggles visibility.
  openPreview: () => set({ previewMounted: true, previewVisible: true }),
  hidePreview: () => set({ previewVisible: false }),
  openConfirm: (confirm) => set({ confirm }),
  closeConfirm: () => set({ confirm: null }),
  // Closing the main sheet tears the preview/confirm down with it.
  close: () => set({ isOpen: false, ...FRESH }),
}));
