import type { Member, MemberStatusLabel } from "./types";

export const getMemberStatus = (
  member: Pick<Member, "joined_at" | "rejected_at" | "is_frozen">,
): MemberStatusLabel => {
  if (member.rejected_at) return "rejected";
  if (member.is_frozen) return "frozen";
  if (!member.joined_at) return "pending";
  return "active";
};
