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

import RoyalMuslim from "./royal-muslim"
import * as royalMuslimForm from "./royal-muslim/form"
import { royalMuslimSchema } from "./royal-muslim/types"
import { royalMuslimAnchors } from "./royal-muslim/anchors"

import ZellijMuslim from "./zellij-muslim"
import * as zellijMuslimForm from "./zellij-muslim/form"
import { zellijMuslimSchema } from "./zellij-muslim/types"
import { zellijMuslimAnchors } from "./zellij-muslim/anchors"

import ClassicChinese from "./classic-chinese"
import * as classicChineseForm from "./classic-chinese/form"
import { classicChineseSchema } from "./classic-chinese/types"
import { classicChineseAnchors } from "./classic-chinese/anchors"

import InkChinese from "./ink-chinese"
import * as inkChineseForm from "./ink-chinese/form"
import { inkChineseSchema } from "./ink-chinese/types"
import { inkChineseAnchors } from "./ink-chinese/anchors"

import PeonyChinese from "./peony-chinese"
import * as peonyChineseForm from "./peony-chinese/form"
import { peonyChineseSchema } from "./peony-chinese/types"
import { peonyChineseAnchors } from "./peony-chinese/anchors"

import PorcelainChinese from "./porcelain-chinese"
import * as porcelainChineseForm from "./porcelain-chinese/form"
import { porcelainChineseSchema } from "./porcelain-chinese/types"
import { porcelainChineseAnchors } from "./porcelain-chinese/anchors"

import ImperialChinese from "./imperial-chinese"
import * as imperialChineseForm from "./imperial-chinese/form"
import { imperialChineseSchema } from "./imperial-chinese/types"
import { imperialChineseAnchors } from "./imperial-chinese/anchors"

import MarigoldIndian from "./marigold-indian"
import * as marigoldIndianForm from "./marigold-indian/form"
import { marigoldIndianSchema } from "./marigold-indian/types"
import { marigoldIndianAnchors } from "./marigold-indian/anchors"

import MehndiIndian from "./mehndi-indian"
import * as mehndiIndianForm from "./mehndi-indian/form"
import { mehndiIndianSchema } from "./mehndi-indian/types"
import { mehndiIndianAnchors } from "./mehndi-indian/anchors"

import MughalIndian from "./mughal-indian"
import * as mughalIndianForm from "./mughal-indian/form"
import { mughalIndianSchema } from "./mughal-indian/types"
import { mughalIndianAnchors } from "./mughal-indian/anchors"

import TempleIndian from "./temple-indian"
import * as templeIndianForm from "./temple-indian/form"
import { templeIndianSchema } from "./temple-indian/types"
import { templeIndianAnchors } from "./temple-indian/anchors"

import LotusIndian from "./lotus-indian"
import * as lotusIndianForm from "./lotus-indian/form"
import { lotusIndianSchema } from "./lotus-indian/types"
import { lotusIndianAnchors } from "./lotus-indian/anchors"

import CreamClassic from "./cream-classic"
import * as creamClassicForm from "./cream-classic/form"
import { creamClassicSchema } from "./cream-classic/types"
import { creamClassicAnchors } from "./cream-classic/anchors"

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
  "royal-muslim": {
    component: RoyalMuslim,
    defaultConfig: { slug: "royal-muslim" },
    form: formFor(royalMuslimForm),
    schema: royalMuslimSchema as ThemeRegistryEntry["schema"],
    anchors: royalMuslimAnchors,
  },
  "zellij-muslim": {
    component: ZellijMuslim,
    defaultConfig: { slug: "zellij-muslim" },
    form: formFor(zellijMuslimForm),
    schema: zellijMuslimSchema as ThemeRegistryEntry["schema"],
    anchors: zellijMuslimAnchors,
  },
  "classic-chinese": {
    component: ClassicChinese,
    defaultConfig: { slug: "classic-chinese" },
    form: formFor(classicChineseForm),
    schema: classicChineseSchema as ThemeRegistryEntry["schema"],
    anchors: classicChineseAnchors,
  },
  "ink-chinese": {
    component: InkChinese,
    defaultConfig: { slug: "ink-chinese" },
    form: formFor(inkChineseForm),
    schema: inkChineseSchema as ThemeRegistryEntry["schema"],
    anchors: inkChineseAnchors,
  },
  "peony-chinese": {
    component: PeonyChinese,
    defaultConfig: { slug: "peony-chinese" },
    form: formFor(peonyChineseForm),
    schema: peonyChineseSchema as ThemeRegistryEntry["schema"],
    anchors: peonyChineseAnchors,
  },
  "porcelain-chinese": {
    component: PorcelainChinese,
    defaultConfig: { slug: "porcelain-chinese" },
    form: formFor(porcelainChineseForm),
    schema: porcelainChineseSchema as ThemeRegistryEntry["schema"],
    anchors: porcelainChineseAnchors,
  },
  "imperial-chinese": {
    component: ImperialChinese,
    defaultConfig: { slug: "imperial-chinese" },
    form: formFor(imperialChineseForm),
    schema: imperialChineseSchema as ThemeRegistryEntry["schema"],
    anchors: imperialChineseAnchors,
  },
  "marigold-indian": {
    component: MarigoldIndian,
    defaultConfig: { slug: "marigold-indian" },
    form: formFor(marigoldIndianForm),
    schema: marigoldIndianSchema as ThemeRegistryEntry["schema"],
    anchors: marigoldIndianAnchors,
  },
  "mehndi-indian": {
    component: MehndiIndian,
    defaultConfig: { slug: "mehndi-indian" },
    form: formFor(mehndiIndianForm),
    schema: mehndiIndianSchema as ThemeRegistryEntry["schema"],
    anchors: mehndiIndianAnchors,
  },
  "mughal-indian": {
    component: MughalIndian,
    defaultConfig: { slug: "mughal-indian" },
    form: formFor(mughalIndianForm),
    schema: mughalIndianSchema as ThemeRegistryEntry["schema"],
    anchors: mughalIndianAnchors,
  },
  "temple-indian": {
    component: TempleIndian,
    defaultConfig: { slug: "temple-indian" },
    form: formFor(templeIndianForm),
    schema: templeIndianSchema as ThemeRegistryEntry["schema"],
    anchors: templeIndianAnchors,
  },
  "lotus-indian": {
    component: LotusIndian,
    defaultConfig: { slug: "lotus-indian" },
    form: formFor(lotusIndianForm),
    schema: lotusIndianSchema as ThemeRegistryEntry["schema"],
    anchors: lotusIndianAnchors,
  },
  "cream-classic": {
    component: CreamClassic,
    defaultConfig: { slug: "cream-classic" },
    form: formFor(creamClassicForm),
    schema: creamClassicSchema as ThemeRegistryEntry["schema"],
    anchors: creamClassicAnchors,
  },
}

export const FallbackTheme = UniqueMuslim
