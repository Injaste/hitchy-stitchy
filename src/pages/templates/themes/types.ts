import type { ComponentType } from "react"
import type { PublicEventConfig } from "@/pages/templates/types"
import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/templates/form"

import type { UniqueMuslimPageConfig } from "./unique-muslim/types"
import type { TraditionalMuslimPageConfig } from "./traditional-muslim/types"
import type { MinimalisticMuslimPageConfig } from "./minimalistic-muslim/types"

export type ThemePageConfig =
  | ({ _theme_slug: "unique-muslim" } & UniqueMuslimPageConfig)
  | ({ _theme_slug: "traditional-muslim" } & TraditionalMuslimPageConfig)
  | ({ _theme_slug: "minimalistic-muslim" } & MinimalisticMuslimPageConfig)
  | { _theme_slug?: null | undefined }

export type ThemeConfigFor<TSlug extends string> = Extract<
  ThemePageConfig,
  { _theme_slug: TSlug }
>

export interface ThemeProps {
  eventConfig: PublicEventConfig
  pageConfig?: ThemePageConfig
}

export interface ConfigEditorProps {
  config: ThemePageConfig
  onChange: (patch: Partial<ThemePageConfig>) => void
}

export interface ThemeFormConfig {
  rsvpClassNames: RSVPFormClassNames
  rsvpLabels: RSVPFormLabels
  rsvpDeleteClassNames: RSVPDeleteClassNames
  rsvpDeleteLabels: RSVPDeleteLabels
}

export interface ThemeRegistryEntry {
  component: ComponentType<ThemeProps>
  defaultConfig: ThemePageConfig
  ConfigEditor: ComponentType<ConfigEditorProps>
  form: ThemeFormConfig
}
