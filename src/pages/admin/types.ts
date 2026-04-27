export type RoleCategory = 'root' | 'admin' | 'general'

export interface AdminBootstrapContext {
  slug: string
  eventId: string
  eventName: string
  dateStart: string  // "yyyy-MM-dd"
  dateEnd: string  // "yyyy-MM-dd"
  memberId: string
  memberDisplayName: string
  memberRoleId: string
  memberRoleName: string
  memberRoleShortName: string
  memberRoleCategory: RoleCategory
}

export const isAdminMember = (category: RoleCategory): boolean =>
  category === 'root' || category === 'admin'