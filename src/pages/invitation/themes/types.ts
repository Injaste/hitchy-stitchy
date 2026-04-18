import type { ComponentType } from "react"
import type { PublicEventConfig } from "@/pages/invitation/types"

export interface ThemeProps {
  eventConfig: PublicEventConfig
  pageConfig?: Record<string, unknown>
}

export interface ThemeConfigField {
  key: string
  type: "text" | "color" | "select" | "boolean"
  label: string
  description?: string
  placeholder?: string
  options?: { value: string; label: string }[]
}

export interface ThemeDefinition {
  component: ComponentType<ThemeProps>
  schema: ThemeConfigField[]
  meta: { name: string; description: string }
}
