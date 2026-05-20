import { create } from "zustand"
import type { ThemeConfig } from "@/pages/wedding/templates/types"

export type ThemeDraftPatch = Record<string, string | null>

interface ThemeSheetState {
  themeId: string | null
  draft: ThemeConfig | null
  initial: ThemeConfig | null
  name: string
  initialName: string
  isDirty: boolean

  init: (themeId: string, config: ThemeConfig, name: string) => void
  setFields: (patch: ThemeDraftPatch) => void
  setName: (name: string) => void
  reset: () => void
  clear: () => void
}

export const useThemeSheetStore = create<ThemeSheetState>((set, get) => ({
  themeId: null,
  draft: null,
  initial: null,
  name: "",
  initialName: "",
  isDirty: false,

  init: (themeId, config, name) => {
    const safe = (config ?? { slug: null }) as ThemeConfig
    set({
      themeId,
      draft: safe,
      initial: safe,
      name,
      initialName: name,
      isDirty: false,
    })
  },

  setFields: (patch) => {
    const { draft, initial, name, initialName } = get()
    if (!draft) return
    const next = { ...draft, ...patch } as ThemeConfig
    set({
      draft: next,
      isDirty: !shallowEqual(next, initial) || name !== initialName,
    })
  },

  setName: (name) => {
    const { draft, initial, initialName } = get()
    set({
      name,
      isDirty: !shallowEqual(draft, initial) || name !== initialName,
    })
  },

  reset: () => {
    const { initial, initialName } = get()
    set({ draft: initial, name: initialName, isDirty: false })
  },

  clear: () =>
    set({
      themeId: null,
      draft: null,
      initial: null,
      name: "",
      initialName: "",
      isDirty: false,
    }),
}))

function shallowEqual(a: object | null, b: object | null) {
  if (a === b) return true
  if (!a || !b) return false
  const ak = Object.keys(a) as (keyof typeof a)[]
  const bk = Object.keys(b) as (keyof typeof b)[]
  if (ak.length !== bk.length) return false
  for (const k of ak) if (a[k] !== b[k]) return false
  return true
}
