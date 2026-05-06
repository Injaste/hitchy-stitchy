import { create } from "zustand"
import type { DetailsDraft, RSVPDraft } from "../types"
import type { ThemeConfig } from "@/pages/templates/themes/types"

interface InvitationState {
  detailsDraft: DetailsDraft | null
  rsvpDraft: RSVPDraft | null
  themeDraft: ThemeConfig | null
  selectedThemeId: string | null

  setSelectedThemeId: (id: string | null) => void
  setDetails: (draft: DetailsDraft) => void
  setRSVP: (draft: RSVPDraft) => void
  setTheme: (draft: ThemeConfig) => void

  clearDetails: () => void
  clearRSVP: () => void
  clearTheme: () => void
}

export const useInvitationStore = create<InvitationState>((set) => ({
  detailsDraft: null,
  rsvpDraft: null,
  themeDraft: null,
  selectedThemeId: null,

  setSelectedThemeId: (id) => set({ selectedThemeId: id, themeDraft: null }),
  setDetails: (draft) => set({ detailsDraft: draft }),
  setRSVP: (draft) => set({ rsvpDraft: draft }),
  setTheme: (draft) => set({ themeDraft: draft }),

  clearDetails: () => set({ detailsDraft: null }),
  clearRSVP: () => set({ rsvpDraft: null }),
  clearTheme: () => set({ themeDraft: null }),
}))