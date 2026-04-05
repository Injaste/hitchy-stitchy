export type RoleCategory = 'root' | 'admin' | 'bridesmaid' | 'general'

export interface DaySegment {
  label: string
  venue: string
}

export interface EventDay {
  id: string
  date?: string
  label: string
  segments: DaySegment[]
}

export interface AdminBootstrapContext {
  slug: string
  eventId: string
  eventName: string
  days: EventDay[]
  memberId: string
  memberDisplayName: string
  memberRoleId: string
  memberRoleName: string
  memberRoleShortName: string
  memberRoleCategory: RoleCategory
}

export const isAdminMember = (category: RoleCategory): boolean =>
  category === 'root' || category === 'admin'
