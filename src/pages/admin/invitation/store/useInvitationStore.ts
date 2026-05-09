import { create } from "zustand"
import type { DetailsDraft, RSVPDraft } from "../types"

export type ThemeDraftValues = Record<string, string | null>

interface InvitationState {
  detailsDraft: DetailsDraft | null
  detailsIsDirty: boolean
  rsvpDraft: RSVPDraft | null
  rsvpIsDirty: boolean
  themeDraft: ThemeDraftValues | null
  themeIsDirty: boolean
  selectedThemeId: string | null

  setSelectedThemeId: (id: string | null) => void
  setDetails: (draft: DetailsDraft, dirty?: boolean) => void
  setRSVP: (draft: RSVPDraft, dirty?: boolean) => void
  setTheme: (draft: ThemeDraftValues, dirty?: boolean) => void

  setDetailsDirty: (dirty: boolean) => void
  setRSVPDirty: (dirty: boolean) => void
  setThemeDirty: (dirty: boolean) => void
}

export const useInvitationStore = create<InvitationState>((set) => ({
  detailsDraft: null,
  detailsIsDirty: false,
  rsvpDraft: null,
  rsvpIsDirty: false,
  themeDraft: null,
  themeIsDirty: false,
  selectedThemeId: null,

  setSelectedThemeId: (id) =>
    set({ selectedThemeId: id, themeDraft: null, themeIsDirty: false }),
  setDetails: (draft, dirty = true) =>
    set({ detailsDraft: draft, detailsIsDirty: dirty }),
  setRSVP: (draft, dirty = true) =>
    set({ rsvpDraft: draft, rsvpIsDirty: dirty }),
  setTheme: (draft, dirty = true) =>
    set({ themeDraft: draft, themeIsDirty: dirty }),

  setDetailsDirty: (dirty) => set({ detailsIsDirty: dirty }),
  setRSVPDirty: (dirty) => set({ rsvpIsDirty: dirty }),
  setThemeDirty: (dirty) => set({ themeIsDirty: dirty }),
}))
