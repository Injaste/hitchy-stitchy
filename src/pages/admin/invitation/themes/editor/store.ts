import { create } from "zustand"
import type { ThemeConfig, SectionListValue } from "@/pages/wedding/templates/types"

// Field values are strings, except structured fields (section-list) which carry
// a typed array.
export type ThemeFieldValue = string | null | SectionListValue
export type ThemeDraftPatch = Record<string, ThemeFieldValue>

// Preview bridge. The unified edit form (useInvitationEditForm) owns the design
// values; the live preview renders in a sibling subtree (right column + detached
// slide-over), so the form mirrors its design values here for the preview to
// read. Also holds the transient hover preview-patch (fonts) — never persisted.
interface ThemeSheetState {
  themeId: string | null
  draft: ThemeConfig | null
  previewPatch: ThemeDraftPatch | null

  init: (themeId: string, config: ThemeConfig | null) => void
  setDraft: (config: ThemeConfig) => void
  setPreviewPatch: (patch: ThemeDraftPatch | null) => void
  clear: () => void
}

export const useThemeSheetStore = create<ThemeSheetState>((set) => ({
  themeId: null,
  draft: null,
  previewPatch: null,

  init: (themeId, config) =>
    set({
      themeId,
      draft: (config ?? { slug: null }) as ThemeConfig,
      previewPatch: null,
    }),
  setDraft: (config) => set({ draft: config }),
  setPreviewPatch: (patch) => set({ previewPatch: patch }),
  clear: () => set({ themeId: null, draft: null, previewPatch: null }),
}))
