import { CheckCircle2, Clock, Snowflake, UserX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Member, MemberStatusLabel } from "./types";

export const getMemberStatus = (
  member: Pick<Member, "joined_at" | "rejected_at" | "frozen_at">,
): MemberStatusLabel => {
  if (member.rejected_at) return "rejected";
  if (member.frozen_at) return "frozen";
  if (!member.joined_at) return "pending";
  return "active";
};

/** Single source of truth for status icon, label, and colour. */
export const MEMBER_STATUS_CONFIG: Record<
  MemberStatusLabel,
  { icon: LucideIcon; label: string; className: string }
> = {
  active:   { icon: CheckCircle2, label: "Active",         className: "text-primary" },
  pending:  { icon: Clock,        label: "Pending invite",  className: "text-muted-foreground" },
  frozen:   { icon: Snowflake,    label: "Frozen",          className: "text-warning" },
  rejected: { icon: UserX,        label: "Declined",        className: "text-destructive/60" },
};

export type MemberGroups = {
  couple: Member[];   // bride + groom
  active: Member[];   // joined or pending (not couple, not inactive)
  inactive: Member[]; // frozen or rejected
};

/**
 * Splits members into three display sections.
 * Replaces the old flat sortMembers — single source of truth for roster order.
 */
/** Roster ordering: active → pending → frozen → rejected. */
const STATUS_ORDER: Record<MemberStatusLabel, number> = {
  active: 0,
  pending: 1,
  frozen: 2,
  rejected: 3,
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

  // Active team: active before pending, with the root (owner) first among actives.
  active.sort((a, b) => {
    const s = byStatus(a, b);
    if (s !== 0) return s;
    return a.is_root === b.is_root ? 0 : a.is_root ? -1 : 1;
  });
  // Inactive: frozen before rejected.
  inactive.sort(byStatus);

  return { couple, active, inactive };
}

/** Derive 1–2 initials from a display name. */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
