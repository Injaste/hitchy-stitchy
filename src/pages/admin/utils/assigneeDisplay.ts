import type { Member } from "@/pages/admin/members/types"
import type { Role } from "@/pages/admin/roles/types"

export function getMemberName(id: string, members: Member[]): string {
  return members.find((m) => m.id === id)?.display_name ?? "Unknown"
}

export function getRoleName(id: string, roles: Role[]): string {
  return roles.find((r) => r.id === id)?.name ?? "Unknown"
}
