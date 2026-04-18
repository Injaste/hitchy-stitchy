import UniqueMuslim from "./unique-muslim"
import { configSchema } from "./unique-muslim/config"
import type { ThemeDefinition, ThemeProps } from "./types"

export type { ThemeProps }
export type { ThemeDefinition, ThemeConfigField } from "./types"

export const themeRegistry: Record<string, ThemeDefinition> = {
  "unique-muslim": {
    component: UniqueMuslim,
    schema: configSchema,
    meta: {
      name: "Unique Muslim",
      description: "An elegant Islamic-inspired invitation design.",
    },
  },
}

export const FallbackTheme = UniqueMuslim
