import { CheckCircle2, Clock, Snowflake, TimerOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { differenceInSeconds } from "date-fns";
import { formatRemainingTime } from "@/lib/utils/utils-time";
import type { Member, MemberStatusLabel } from "./types";

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

/** Default invite-link lifetime, shown on the fresh-invite panel. Mirrors the
 *  interval the claim/regenerate RPCs stamp into invite_expires_at. */
export const INVITE_TTL_DAYS = 7;

/** Share text prepended to the invite link (WhatsApp/Telegram). Single source —
 *  edit here. A per-event customizable version is a documented follow-up
 *  (docs/todo/mvp-phase-1-member-invite.md). */
export const INVITE_MESSAGE =
  "You've been invited to help plan our wedding on Hitchy Stitchy. Join here:";

/** Regenerate cooldown — mirrors the 1-minute limit regenerate_member_invite
 *  enforces, so the UI can reject a too-soon click without a doomed round-trip. */
export const INVITE_REGEN_COOLDOWN_MS = 60_000;

/** True if the link was (re)issued within the cooldown and can't rotate yet.
 *  Last-issued = invite_expires_at − the TTL. */
export function isRegenerateOnCooldown(inviteExpiresAt: string): boolean {
  const lastIssued =
    new Date(inviteExpiresAt).getTime() - INVITE_TTL_DAYS * 86_400_000;
  return lastIssued > Date.now() - INVITE_REGEN_COOLDOWN_MS;
}

/** Expiry state of a pending invite link, from its invite_expires_at deadline.
 *  `remaining` is the single largest unit, long form (e.g. "5 days", "3 hours"). */
export function getInviteExpiry(expiresAt: string): { expired: boolean; remaining: string } {
  const secondsLeft = differenceInSeconds(new Date(expiresAt), new Date());
  return {
    expired: secondsLeft <= 0,
    remaining: formatRemainingTime(secondsLeft, 1, "long"),
  };
}

/** Single source of truth for status icon, label, and colour. */
export const MEMBER_STATUS_CONFIG: Record<
  MemberStatusLabel,
  { icon: LucideIcon; label: string; className: string }
> = {
  active: { icon: CheckCircle2, label: "Active", className: "text-primary" },
  pending: {
    icon: Clock,
    label: "Pending invite",
    className: "text-muted-foreground",
  },
  frozen: { icon: Snowflake, label: "Frozen", className: "text-freeze" },
  expired: {
    icon: TimerOff,
    label: "Expired",
    className: "text-destructive/60",
  },
};

export type MemberGroups = {
  couple: Member[]; // bride + groom
  active: Member[]; // joined or pending (not couple, not inactive)
  inactive: Member[]; // expired + frozen
};

/**
 * Splits members into three display sections.
 * Replaces the old flat sortMembers — single source of truth for roster order.
 */
/** Roster ordering: active → pending → expired → frozen. */
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
      inactive.push(m); // expired + frozen
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
  // Inactive: expired before frozen.
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
