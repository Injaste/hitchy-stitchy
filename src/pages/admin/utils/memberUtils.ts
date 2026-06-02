import type { Member } from "@/pages/admin/members/types";

export function isActiveMember(
  m: Pick<Member, "joined_at" | "frozen_at">,
): boolean {
  return m.joined_at !== null && !m.frozen_at;
}

export function getMemberName(id: string, members: Member[]): string {
  return members.find((m) => m.id === id)?.display_name ?? "Unknown";
}

export function getMemberRank(
  m: Pick<Member, "is_root" | "is_bride" | "is_groom">,
): number {
  if (m.is_root) return 0;
  if (m.is_bride || m.is_groom) return 1;
  return 2;
}

/**
 * Groups members by their (non-empty) label, sorted by label name. Pass the
 * same member set you show as individuals so groups stay consistent with it.
 */
export function groupMembersByLabel(
  members: Pick<Member, "id" | "label">[],
): { name: string; memberIds: string[] }[] {
  const byLabel = new Map<string, string[]>();
  for (const m of members) {
    const name = m.label?.trim();
    if (!name) continue;
    const ids = byLabel.get(name) ?? [];
    ids.push(m.id);
    byLabel.set(name, ids);
  }
  return Array.from(byLabel, ([name, memberIds]) => ({ name, memberIds })).sort(
    (a, b) => a.name.localeCompare(b.name),
  );
}
