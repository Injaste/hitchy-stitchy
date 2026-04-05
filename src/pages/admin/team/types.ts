import type { RoleCategory } from '../../types'

export interface Role {
  id: string
  eventId: string
  name: string
  shortName: string
  category: RoleCategory
  description?: string
}

export interface TeamMember {
  id: string
  eventId: string
  roleId: string
  role: Role
  displayName: string
  email: string
  isActive: boolean
  arrivedAt?: string
  joinedAt?: string
}
