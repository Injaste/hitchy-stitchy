import type { ThemeConfig } from "@/pages/templates/themes/types"

export interface Template {
  id: string
  name: string
  slug: string
  description: string | null
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Theme {
  id: string
  event_id: string
  template_id: string | null
  name: string
  is_published: boolean
  config: ThemeConfig
  created_at: string
  updated_at: string
  theme?: Pick<Template, "id" | "name" | "slug"> | null
}

export interface CreateThemePayload {
  event_id: string
  template_id: string
}

export interface UpdateThemePayload {
  id: string
  config: ThemeConfig
}
