import type { Member } from "@/pages/admin/members/types";
import { getMemberStatus } from "@/pages/admin/members/utils";

export function isActiveMember(
  m: Pick<Member, "joined_at" | "frozen_at">,
): boolean {
  return m.joined_at !== null && !m.frozen_at;
}

export function getMemberName(id: string, members: Member[]): string {
  return members.find((m) => m.id === id)?.display_name ?? "Unknown";
}

/** Members eligible to be newly assigned to tasks/timeline — active or pending
 *  (excludes expired + frozen). Pending is allowed so a planner can pre-assign an
 *  invitee before they sign up. Mirrors the server's add-time assignee check.
 *  Shared by TaskForm + TimelineItemForm so the rule lives in one place. */
export function getAssignableMembers(members: Member[]): Member[] {
  return members.filter((m) => {
    const status = getMemberStatus(m);
    return status === "active" || status === "pending";
  });
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

/** Field-ready assignee options for <AssigneeField> — the assignable members
 *  mapped to {id,label} plus their role groups. One place so TaskForm +
 *  TimelineItemForm can't drift apart. Role groups are the "Labels" bulk-select
 *  shortcut, so only surface a role that 2+ members share — a single-member role
 *  would just duplicate that member's own chip. */
export function getMemberAssigneeOptions(members: Member[]): {
  items: { id: string; label: string }[];
  groups: { name: string; memberIds: string[] }[];
} {
  const assignable = getAssignableMembers(members);
  return {
    items: assignable.map((m) => ({ id: m.id, label: m.display_name })),
    groups: groupMembersByRole(assignable).filter(
      (g) => g.memberIds.length >= 2,
    ),
  };
}
