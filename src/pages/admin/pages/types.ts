export interface EventTheme {
  id: string
  name: string
  slug: string
  description: string | null
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EventPage {
  id: string
  event_id: string
  theme_id: string | null
  name: string
  is_published: boolean
  config: Record<string, unknown>
  created_at: string
  updated_at: string
  theme?: Pick<EventTheme, 'id' | 'name' | 'slug'> | null
}

export interface CreatePagePayload {
  event_id: string
  theme_id: string
  name: string
  config: Record<string, unknown>
}

export interface UpdatePagePayload {
  id: string
  name?: string
  config?: Record<string, unknown>
}
