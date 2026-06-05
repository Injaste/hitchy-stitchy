import type { Member } from "@/pages/admin/members/types";

export function isActiveMember(
  m: Pick<Member, "joined_at" | "frozen_at">,
): boolean {
  return m.joined_at !== null && !m.frozen_at;
}

export function getMemberName(id: string, members: Member[]): string {
  return members.find((m) => m.id === id)?.display_name ?? "Unknown";
}

/**
 * Whether a member bypasses all permission checks — mirrors the server's
 * is_super_admin(): root (event owner) or couple (bride/groom).
 * Note: this is about the *member*, not the current viewer (use useAccess for that).
 */
export function isSuperAdminMember(
  m: Pick<Member, "is_root" | "is_bride" | "is_groom">,
): boolean {
  return m.is_root || m.is_bride || m.is_groom;
}

/**
 * Groups members by their (non-empty) role, sorted by role name. Pass the
 * same member set you show as individuals so groups stay consistent with it.
 */
export function groupMembersByRole(
  members: Pick<Member, "id" | "role">[],
): { name: string; memberIds: string[] }[] {
  const byRole = new Map<string, string[]>();
  for (const m of members) {
    const name = m.role?.trim();
    if (!name) continue;
    const ids = byRole.get(name) ?? [];
    ids.push(m.id);
    byRole.set(name, ids);
  }
  return Array.from(byRole, ([name, memberIds]) => ({ name, memberIds })).sort(
    (a, b) => a.name.localeCompare(b.name),
  );
}
