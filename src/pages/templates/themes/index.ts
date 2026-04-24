import type { ComponentType } from "react"
import UniqueMuslim from "./unique-muslim"
import type { ThemeProps } from "./unique-muslim"
import type { UniqueMuslimPageConfig } from "./unique-muslim/types"
import UniqueMuslimConfigEditor from "./unique-muslim/ConfigEditor"

export type { ThemeProps }
export type { UniqueMuslimPageConfig }

export type ThemePageConfig =
  | ({ _theme_slug: "unique-muslim" } & UniqueMuslimPageConfig)
  | { _theme_slug?: null | undefined }

export type ThemeConfigFor<TSlug extends string> = Extract<ThemePageConfig, { _theme_slug: TSlug }>

export interface ConfigEditorProps {
  config: ThemePageConfig
  onChange: (patch: Partial<ThemePageConfig>) => void
}

interface ThemeRegistryEntry {
  component: ComponentType<ThemeProps>
  defaultConfig: ThemePageConfig
  ConfigEditor: ComponentType<ConfigEditorProps>
}

export const themeRegistry: Record<string, ThemeRegistryEntry> = {
  "unique-muslim": {
    component: UniqueMuslim,
    defaultConfig: { _theme_slug: "unique-muslim", background_image: null },
    ConfigEditor: UniqueMuslimConfigEditor,
  },
}

export const FallbackTheme = UniqueMuslim
