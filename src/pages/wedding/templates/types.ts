import type { ComponentType } from "react"
import type { UniqueMuslimPageConfig } from "./unique-muslim/types"
import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"
import type { PublicEventConfig } from "../types"

export type FieldType = "text" | "textarea" | "select" | "switch" | "image"

export interface FieldOption {
  label: string
  value: string
}

export interface ThemeFieldSchema {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: FieldOption[]
}

export interface ThemeFieldGroup {
  title: string
  fields: ThemeFieldSchema[]
}

export type ThemeConfig =
  | UniqueMuslimPageConfig
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
  /** Google Fonts stylesheet URLs to inject for this theme */
  fonts?: string[]
}