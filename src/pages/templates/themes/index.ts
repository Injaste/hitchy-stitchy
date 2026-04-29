import UniqueMuslim from "./unique-muslim"
import UniqueMuslimConfigEditor from "./unique-muslim/ConfigEditor"
import * as uniqueMuslimForm from "./unique-muslim/form"

import TraditionalMuslim from "./traditional-muslim"
import TraditionalMuslimConfigEditor from "./traditional-muslim/ConfigEditor"
import * as traditionalMuslimForm from "./traditional-muslim/form"

import MinimalisticMuslim from "./minimalistic-muslim"
import MinimalisticMuslimConfigEditor from "./minimalistic-muslim/ConfigEditor"
import * as minimalisticMuslimForm from "./minimalistic-muslim/form"

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
  "traditional-muslim": {
    component: TraditionalMuslim,
    defaultConfig: {
      _theme_slug: "traditional-muslim",
      background_image: null,
      ornament_color: null,
    },
    ConfigEditor: TraditionalMuslimConfigEditor,
    form: formFor(traditionalMuslimForm),
  },
  "minimalistic-muslim": {
    component: MinimalisticMuslim,
    defaultConfig: { _theme_slug: "minimalistic-muslim", accent_label: null },
    ConfigEditor: MinimalisticMuslimConfigEditor,
    form: formFor(minimalisticMuslimForm),
  },
}

export const FallbackTheme = UniqueMuslim
