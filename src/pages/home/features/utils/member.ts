import { CheckCircle2, Clock, Snowflake, TimerOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { differenceInSeconds } from "date-fns";

import { formatRemainingTime } from "@/lib/utils/utils-time";
import type { Member, MemberStatusLabel } from "../types";

export { type MemberStatusLabel };

export const getMemberStatus = (
  member: Pick<Member, "joined_at" | "frozen_at" | "invite_expires_at">,
): MemberStatusLabel => {
  if (member.frozen_at) return "frozen";
  if (!member.joined_at) {
    return member.invite_expires_at &&
      getInviteExpiry(member.invite_expires_at).expired
      ? "expired"
      : "pending";
  }
  return "active";
};

function getInviteExpiry(expiresAt: string): { expired: boolean; remaining: string } {
  const secondsLeft = differenceInSeconds(new Date(expiresAt), new Date());
  return {
    expired: secondsLeft <= 0,
    remaining: formatRemainingTime(secondsLeft, 1, "long"),
  };
}

export const MEMBER_STATUS_CONFIG: Record<
  MemberStatusLabel,
  { icon: LucideIcon; label: string; className: string }
> = {
  active: { icon: CheckCircle2, label: "Active", className: "text-primary" },
  pending: { icon: Clock, label: "Pending invite", className: "text-muted-foreground" },
  frozen: { icon: Snowflake, label: "Frozen", className: "text-freeze" },
  expired: { icon: TimerOff, label: "Expired", className: "text-destructive/60" },
};

export type MemberGroups = {
  couple: Member[];
  active: Member[];
  inactive: Member[];
};

const STATUS_ORDER: Record<MemberStatusLabel, number> = {
  active: 0,
  pending: 1,
  expired: 2,
  frozen: 3,
};

export function groupMembers(members: Member[]): MemberGroups {
  const couple: Member[] = [];
  const active: Member[] = [];
  const inactive: Member[] = [];

  for (const m of members) {
    const status = getMemberStatus(m);
    if (m.is_bride || m.is_groom) {
      couple.push(m);
    } else if (status === "active" || status === "pending") {
      active.push(m);
    } else {
      inactive.push(m);
    }
  }

  const byStatus = (a: Member, b: Member) =>
    STATUS_ORDER[getMemberStatus(a)] - STATUS_ORDER[getMemberStatus(b)];

  active.sort((a, b) => {
    const s = byStatus(a, b);
    if (s !== 0) return s;
    return a.is_root === b.is_root ? 0 : a.is_root ? -1 : 1;
  });
  inactive.sort(byStatus);

  return { couple, active, inactive };
}

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function isSuperAdminMember(
  m: Pick<Member, "is_root" | "is_bride" | "is_groom">,
): boolean {
  return m.is_root || m.is_bride || m.is_groom;
}
