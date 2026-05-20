import { createModalStore } from "../../hooks/useModalStore"
import type { Theme } from "../types"

interface InvitationModalAddons {
  isPublishOpen: boolean
  selectedTemplateId: string | null

  openCreate: (templateId: string) => void
  openDelete: (theme: Theme) => void
  openPublish: (theme: Theme) => void
  extendedCloseAll: () => void
  extendedReset: () => void
}

export const useInvitationModalStore = createModalStore<Theme, InvitationModalAddons>((set) => ({
  isPublishOpen: false,
  selectedTemplateId: null,

  openCreate: (templateId: string) => set({
    isCreateOpen: true,
    selectedTemplateId: templateId,
  }),
  openDelete: (theme: Theme) => set({
    isDeleteOpen: true,
    selectedItem: theme,
  }),
  openPublish: (theme: Theme) => set({
    isPublishOpen: true,
    selectedItem: theme,
  }),

  extendedCloseAll: () => set({ isPublishOpen: false }),
  extendedReset: () => set({ selectedTemplateId: null }),
}))
