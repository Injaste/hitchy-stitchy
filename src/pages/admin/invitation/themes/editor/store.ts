import { create } from "zustand"
import type { ThemeConfig, SectionListValue } from "@/pages/wedding/templates/types"
import type { PublicEventConfig } from "@/pages/wedding/types"

// Field values are strings, except structured fields (section-list) which carry
// a typed array.
export type ThemeFieldValue = string | null | SectionListValue
export type ThemeDraftPatch = Record<string, ThemeFieldValue>

// The live RSVP-settings slice the preview reads — mirrored from the edit form so
// mode/limits/deadline changes show in the preview without needing a save.
export type RsvpPreview = Pick<
  PublicEventConfig,
  | "rsvp_mode"
  | "rsvp_deadline"
  | "max_guests"
  | "guest_count_min"
  | "guest_count_max"
  | "confirmation_message"
  | "config"
>

// Preview bridge. The unified edit form (useInvitationEditForm) owns the design
// values; the live preview renders in a sibling subtree (right column + detached
// slide-over), so the form mirrors its design values here for the preview to
// read. Also holds the transient hover preview-patch (fonts) — never persisted.
interface ThemeSheetState {
  themeId: string | null
  draft: ThemeConfig | null
  previewPatch: ThemeDraftPatch | null
  rsvp: RsvpPreview | null

  init: (themeId: string, config: ThemeConfig | null) => void
  setDraft: (config: ThemeConfig) => void
  setPreviewPatch: (patch: ThemeDraftPatch | null) => void
  setRsvp: (rsvp: RsvpPreview | null) => void
  clear: () => void
}

export const useThemeSheetStore = create<ThemeSheetState>((set) => ({
  themeId: null,
  draft: null,
  previewPatch: null,
  rsvp: null,

  init: (themeId, config) =>
    set({
      themeId,
      draft: (config ?? { slug: null }) as ThemeConfig,
      previewPatch: null,
      rsvp: null,
    }),
  setDraft: (config) => set({ draft: config }),
  setPreviewPatch: (patch) => set({ previewPatch: patch }),
  setRsvp: (rsvp) => set({ rsvp }),
  clear: () => set({ themeId: null, draft: null, previewPatch: null, rsvp: null }),
}))
