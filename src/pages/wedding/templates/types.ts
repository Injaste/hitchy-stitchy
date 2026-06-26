import type { ComponentType } from "react"
import type { UniqueMuslimPageConfig } from "./unique-muslim/types"
import type { GeometricMuslimPageConfig } from "./geometric-muslim/types"
import type { CrescentMuslimPageConfig } from "./crescent-muslim/types"
import type { RoyalMuslimPageConfig } from "./royal-muslim/types"
import type { ZellijMuslimPageConfig } from "./zellij-muslim/types"
import type { ClassicChinesePageConfig } from "./classic-chinese/types"
import type { InkChinesePageConfig } from "./ink-chinese/types"
import type { PeonyChinesePageConfig } from "./peony-chinese/types"
import type { PorcelainChinesePageConfig } from "./porcelain-chinese/types"
import type { ImperialChinesePageConfig } from "./imperial-chinese/types"
import type { MarigoldIndianPageConfig } from "./marigold-indian/types"
import type { MehndiIndianPageConfig } from "./mehndi-indian/types"
import type { MughalIndianPageConfig } from "./mughal-indian/types"
import type { TempleIndianPageConfig } from "./temple-indian/types"
import type { LotusIndianPageConfig } from "./lotus-indian/types"
import type { CreamClassicPageConfig } from "./cream-classic/types"
import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"
import type { PublicEventConfig } from "../types"

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "switch"
  | "image"
  | "font"
  | "date"
  | "time"
  | "section-list"

export interface FieldOption {
  label: string
  value: string
}

// A "section-list" value: titled sections, each holding rows keyed by the
// field's itemFields (e.g. { time, label }). Stored as real jsonb (typed,
// queryable) — not a JSON-encoded string.
export type SectionListItem = Record<string, string>
export interface SectionListSection {
  title: string
  items: SectionListItem[]
}
export type SectionListValue = SectionListSection[]

export interface SectionItemFieldSchema {
  key: string
  label: string
  placeholder?: string
}

export interface ThemeFieldSchema {
  key: string
  label: string
  type: FieldType
  placeholder: string
  options?: FieldOption[]
  default?: string
  hint?: string
  hintUrl?: string
  hintUrlLabel?: string
  /** For type "section-list": the per-row sub-fields (e.g. time, label). */
  itemFields?: SectionItemFieldSchema[]
}

export interface ThemeFieldGroup {
  title: string
  description?: string
  descriptionUrl?: string
  descriptionUrlLabel?: string
  fields: ThemeFieldSchema[]
}

export type ThemeConfig =
  | UniqueMuslimPageConfig
  | GeometricMuslimPageConfig
  | CrescentMuslimPageConfig
  | RoyalMuslimPageConfig
  | ZellijMuslimPageConfig
  | ClassicChinesePageConfig
  | InkChinesePageConfig
  | PeonyChinesePageConfig
  | PorcelainChinesePageConfig
  | ImperialChinesePageConfig
  | MarigoldIndianPageConfig
  | MehndiIndianPageConfig
  | MughalIndianPageConfig
  | TempleIndianPageConfig
  | LotusIndianPageConfig
  | CreamClassicPageConfig
  | { slug?: null | undefined }

export type ThemeConfigFor<TSlug extends string> = Extract<ThemeConfig, { slug: TSlug }>

export interface ThemeProps {
  eventConfig: PublicEventConfig
  pageConfig: ThemeConfig
  /** True once the loading overlay has finished its animation. Theme preloaders should wait for this before triggering. */
  loaderReady?: boolean
}

export interface ThemeFormConfig {
  rsvpClassNames: RSVPFormClassNames
  rsvpLabels: RSVPFormLabels
  rsvpDeleteClassNames: RSVPDeleteClassNames
  rsvpDeleteLabels: RSVPDeleteLabels
}

export interface ThemeRegistryEntry {
  component: ComponentType<ThemeProps>
  defaultConfig: ThemeConfig
  form: ThemeFormConfig
  schema: ThemeFieldGroup[]
  anchors: AnchorThemeConfig
}