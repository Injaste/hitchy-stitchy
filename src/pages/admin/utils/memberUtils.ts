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
