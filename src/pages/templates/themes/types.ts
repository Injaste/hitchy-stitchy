import type { ComponentType } from "react"
import type { PublicEventConfig } from "@/pages/templates/types"
import type { UniqueMuslimPageConfig } from "./unique-muslim/types"
import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/templates/form"


export type ThemeConfig =
  | UniqueMuslimPageConfig
  | { slug?: null | undefined }

export type ThemeConfigFor<TSlug extends string> = Extract<
  ThemeConfig,
  { slug: TSlug }
>

export interface ThemeProps {
  eventConfig: PublicEventConfig
  pageConfig?: ThemeConfig
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
}
