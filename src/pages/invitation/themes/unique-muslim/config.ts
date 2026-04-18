import type { ThemeConfigField } from "../types"

export interface UniqueMuslimConfig {
  background_image: string
}

export function resolveConfig(raw?: Record<string, unknown>): UniqueMuslimConfig {
  return {
    background_image: (raw?.background_image as string) ?? "/dannad.png",
  }
}

export const configSchema: ThemeConfigField[] = [
  {
    key: "background_image",
    type: "text",
    label: "Background Image",
    description: "Path or URL for the decorative background image",
    placeholder: "/image.png or https://...",
  },
]
