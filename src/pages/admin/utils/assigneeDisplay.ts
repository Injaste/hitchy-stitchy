import type { TeamMember, Role } from "@/pages/admin/team/types";

export function getMemberName(id: string, members: TeamMember[]): string {
  return members.find((m) => m.id === id)?.displayName ?? "Unknown"
}

export function getRoleName(id: string, roles: Role[]): string {
  return roles.find((r) => r.id === id)?.name ?? "Unknown"
}
