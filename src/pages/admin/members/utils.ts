import type { Member, MemberStatusLabel } from "./types";

export const getMemberStatus = (
  member: Pick<Member, "joined_at" | "rejected_at" | "frozen_at">,
): MemberStatusLabel => {
  if (member.rejected_at) return "rejected";
  if (member.frozen_at) return "frozen";
  if (!member.joined_at) return "pending";
  return "active";
};
