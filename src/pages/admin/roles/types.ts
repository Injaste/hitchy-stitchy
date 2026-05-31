export interface Role {
  id: string
  event_id: string
  name: string
  /** Nested permissions jsonb: { resource: { action: bool } } */
  permissions: Record<string, Record<string, boolean>>
  created_at: string
  updated_at: string
}

export interface CreateRolePayload {
  event_id: string
  name: string
}

export interface UpdateRolePayload {
  event_id: string
  id: string
  name?: string
  permissions?: Record<string, Record<string, boolean>>
}

export interface DeleteRolePayload {
  event_id: string
  id: string
  name: string
}
