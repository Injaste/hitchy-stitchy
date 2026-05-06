import { createModalStore } from "../../hooks/useModalStore"
import type { Theme } from "../types"

interface InvitationModalState {
  isPublishOpen: boolean
  selectedTemplateId: string | null

  openCreate: (templateId: string) => void
  openDelete: (theme: Theme) => void
  openPublish: (theme: Theme) => void
  closeAll: () => void
}

export const useInvitationModalStore = createModalStore<InvitationModalState>((set) => ({
  isCreateOpen: false,
  isDeleteOpen: false,
  isPublishOpen: false,
  selectedTheme: null,
  selectedTemplateId: null,

  openCreate: (templateId: string) => set({
    isCreateOpen: true,
    selectedTemplateId: templateId,
  }),
  openDelete: (theme: Theme) => set({
    isDeleteOpen: true,
    selectedTheme: theme,
  }),
  openPublish: (theme: Theme) => set({
    isPublishOpen: true,
    selectedTheme: theme,
  }),
  closeAll: () => set({
    isCreateOpen: false,
    isDeleteOpen: false,
    isPublishOpen: false,
    selectedTheme: null,
    selectedTemplateId: null,
  }),
}))

