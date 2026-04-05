import type { Role, TeamMember } from './types'
import { mockRoles, mockMembers } from './data'

// TODO: replace with live Supabase query
export async function fetchRoles(eventId: string): Promise<Role[]> {
  await new Promise((r) => setTimeout(r, 200))
  return mockRoles
}

// TODO: replace with live Supabase query
export async function fetchMembers(eventId: string): Promise<TeamMember[]> {
  await new Promise((r) => setTimeout(r, 200))
  return mockMembers
}

// TODO: replace with live Supabase query
export async function createRole(role: Omit<Role, 'id'>): Promise<Role> {
  await new Promise((r) => setTimeout(r, 200))
  return { ...role, id: crypto.randomUUID() }
}

// TODO: replace with live Supabase query
export async function updateRole(role: Role): Promise<Role> {
  await new Promise((r) => setTimeout(r, 200))
  return role
}

// TODO: replace with live Supabase query
export async function deleteRole(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}

// TODO: replace with live Supabase query
export async function updateMemberActive(memberId: string, isActive: boolean): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}

// TODO: replace with live Supabase query
export async function inviteMember(payload: {
  eventId: string; email: string; roleId: string; displayName: string
}): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}
