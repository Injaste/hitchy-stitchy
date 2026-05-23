import UniqueMuslim from "./unique-muslim"
import * as uniqueMuslimForm from "./unique-muslim/form"
import { uniqueMuslimSchema, UNIQUE_MUSLIM_FONTS } from "./unique-muslim/types"

import type { ThemeRegistryEntry } from "./types"

export type {
  ThemeConfig as ThemePageConfig,
  ThemeConfigFor,
  ThemeProps,
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
    defaultConfig: { slug: "unique-muslim", background_image: null },
    form: formFor(uniqueMuslimForm),
    schema: uniqueMuslimSchema as ThemeRegistryEntry["schema"],
    fonts: UNIQUE_MUSLIM_FONTS,
  },
}

export const FallbackTheme = UniqueMuslim
