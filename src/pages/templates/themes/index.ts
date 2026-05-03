import UniqueMuslim from "./unique-muslim"
import UniqueMuslimConfigEditor from "./unique-muslim/ConfigEditor"
import * as uniqueMuslimForm from "./unique-muslim/form"

import type { ThemeRegistryEntry } from "./types"

export type {
  ThemePageConfig,
  ThemeConfigFor,
  ThemeProps,
  ConfigEditorProps,
  ThemeFormConfig,
  ThemeRegistryEntry,
} from "./types"

const formFor = (mod: typeof uniqueMuslimForm) => ({
  rsvpClassNames: mod.rsvpClassNames,
  rsvpLabels: mod.rsvpLabels,
  rsvpDeleteClassNames: mod.rsvpDeleteClassNames,
  rsvpDeleteLabels: mod.rsvpDeleteLabels,
})

export const themeRegistry: Record<string, ThemeRegistryEntry> = {
  "unique-muslim": {
    component: UniqueMuslim,
    defaultConfig: { _theme_slug: "unique-muslim", background_image: null },
    ConfigEditor: UniqueMuslimConfigEditor,
    form: formFor(uniqueMuslimForm),
  },
}

export const FallbackTheme = UniqueMuslim
