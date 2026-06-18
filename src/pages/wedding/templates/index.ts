import UniqueMuslim from "./unique-muslim"
import * as uniqueMuslimForm from "./unique-muslim/form"
import { uniqueMuslimSchema } from "./unique-muslim/types"
import { uniqueMuslimAnchors } from "./unique-muslim/anchors"

import GeometricMuslim from "./geometric-muslim"
import * as geometricMuslimForm from "./geometric-muslim/form"
import { geometricMuslimSchema } from "./geometric-muslim/types"
import { geometricMuslimAnchors } from "./geometric-muslim/anchors"

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
    anchors: uniqueMuslimAnchors,
  },
  "geometric-muslim": {
    component: GeometricMuslim,
    defaultConfig: { slug: "geometric-muslim" },
    form: formFor(geometricMuslimForm),
    schema: geometricMuslimSchema as ThemeRegistryEntry["schema"],
    anchors: geometricMuslimAnchors,
  },
}

export const FallbackTheme = UniqueMuslim
