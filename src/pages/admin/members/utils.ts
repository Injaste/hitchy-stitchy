import type { Member, MemberStatusLabel } from "./types";

export const getMemberStatus = (
  member: Pick<Member, "joined_at" | "rejected_at" | "frozen_at">,
): MemberStatusLabel => {
  if (member.rejected_at) return "rejected";
  if (member.frozen_at) return "frozen";
  if (!member.joined_at) return "pending";
  return "active";
};

/** Derive 1–2 initials from a display name. */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
