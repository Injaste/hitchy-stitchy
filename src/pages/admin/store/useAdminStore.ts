import { create } from 'zustand'
import type { AdminBootstrapContext, EventDay, RoleCategory } from '../types'

interface AdminState extends AdminBootstrapContext {
  isBootstrapped: boolean
  bootstrapError: string | null
  setContext: (ctx: AdminBootstrapContext) => void
  setBootstrapError: (msg: string) => void
}

export const useAdminStore = create<AdminState>((set) => ({
  slug: '',
  eventId: '',
  eventName: '',
  days: [] as EventDay[],
  memberId: '',
  memberDisplayName: '',
  memberRoleId: '',
  memberRoleName: '',
  memberRoleShortName: '',
  memberRoleCategory: 'general' as RoleCategory,
  isBootstrapped: false,
  bootstrapError: null,

  setContext: (ctx) =>
    set({ ...ctx, isBootstrapped: true, bootstrapError: null }),

  setBootstrapError: (msg) =>
    set({ bootstrapError: msg, isBootstrapped: false }),
}))
