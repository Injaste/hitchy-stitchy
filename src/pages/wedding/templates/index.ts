import UniqueMuslim from "./unique-muslim"
import * as uniqueMuslimForm from "./unique-muslim/form"
import { uniqueMuslimSchema } from "./unique-muslim/types"
import { uniqueMuslimAnchors } from "./unique-muslim/anchors"

import GeometricMuslim from "./geometric-muslim"
import * as geometricMuslimForm from "./geometric-muslim/form"
import { geometricMuslimSchema } from "./geometric-muslim/types"
import { geometricMuslimAnchors } from "./geometric-muslim/anchors"

import CrescentMuslim from "./crescent-muslim"
import * as crescentMuslimForm from "./crescent-muslim/form"
import { crescentMuslimSchema } from "./crescent-muslim/types"
import { crescentMuslimAnchors } from "./crescent-muslim/anchors"

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
  "crescent-muslim": {
    component: CrescentMuslim,
    defaultConfig: { slug: "crescent-muslim" },
    form: formFor(crescentMuslimForm),
    schema: crescentMuslimSchema as ThemeRegistryEntry["schema"],
    anchors: crescentMuslimAnchors,
  },
}

export const FallbackTheme = UniqueMuslim
