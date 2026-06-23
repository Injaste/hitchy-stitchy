import { CheckCircle2, Clock, Snowflake, TimerOff, Banknote, Coins, Mail, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { differenceInSeconds, differenceInCalendarDays, format, parseISO } from "date-fns";

import { formatRemainingTime } from "@/lib/utils/utils-time";

import type { Member, MemberStatusLabel, Expense, ExpenseStatus, BudgetSummary, GiftMethod } from "./types";

// ── Member ─────────────────────────────────────────────────────────────────

export { type MemberStatusLabel };

export type MemberGroups = {
  couple: Member[];
  active: Member[];
  inactive: Member[];
};

export const getMemberStatus = (
  member: Pick<Member, "joined_at" | "frozen_at" | "invite_expires_at">,
): MemberStatusLabel => {
  if (member.frozen_at) return "frozen";
  if (!member.joined_at) {
    return member.invite_expires_at && getInviteExpiry(member.invite_expires_at).expired
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

// ── Budget ─────────────────────────────────────────────────────────────────

export type { BudgetSummary, ExpenseStatus };

export function statusOf(e: Expense): ExpenseStatus {
  if (e.paid <= 0) return "unpaid";
  if (e.paid >= e.amount) return "paid";
  return "partial";
}

export function stripeColor(e: Expense): string | null {
  if (e.amount <= 0) return null;
  const p = Math.max(0, Math.min(1, e.paid / e.amount));
  if (p >= 1) return null;

  if (p <= 0.5) {
    const pct = (p / 0.5) * 100;
    return `color-mix(in oklch, var(--color-warning) ${pct}%, var(--color-destructive))`;
  }
  const pct = ((p - 0.5) / 0.5) * 100;
  return `color-mix(in oklch, var(--color-success) ${pct}%, var(--color-warning))`;
}

export type DueUrgency = "overdue" | "soon" | "upcoming" | "settled" | "none";

export function dueInfo(e: Expense): { urgency: DueUrgency; label: string } {
  if (statusOf(e) === "paid") return { urgency: "settled", label: "" };
  if (!e.due_at) return { urgency: "none", label: "" };

  const days = differenceInCalendarDays(parseISO(e.due_at), new Date());
  if (days < 0) return { urgency: "overdue", label: `${Math.abs(days)}d` };
  if (days === 0) return { urgency: "soon", label: "Today" };
  if (days <= 14) return { urgency: "soon", label: `${days}d` };
  return { urgency: "upcoming", label: format(parseISO(e.due_at), "d MMM") };
}

const URGENCY_RANK: Record<DueUrgency, number> = {
  overdue: 0,
  soon: 1,
  upcoming: 2,
  none: 3,
  settled: 4,
};

export function sortExpenses(list: Expense[]): Expense[] {
  return [...list].sort((a, b) => {
    const ra = URGENCY_RANK[dueInfo(a).urgency];
    const rb = URGENCY_RANK[dueInfo(b).urgency];
    if (ra !== rb) return ra - rb;
    if (a.due_at && b.due_at && a.due_at !== b.due_at)
      return a.due_at < b.due_at ? -1 : 1;
    return b.amount - a.amount;
  });
}

export function computeSummary(expenses: Expense[], budgetTotal: number | null): BudgetSummary {
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paid = expenses.reduce((sum, e) => sum + e.paid, 0);

  const dueSoon = expenses.reduce((sum, e) => {
    const { urgency } = dueInfo(e);
    return urgency === "overdue" || urgency === "soon" ? sum + (e.amount - e.paid) : sum;
  }, 0);

  const clamp = (n: number) => Math.max(0, Math.min(1, n));

  return {
    budgetTotal,
    spent,
    paid,
    remaining: budgetTotal === null ? null : budgetTotal - spent,
    outstanding: spent - paid,
    dueSoon,
    spentPct: budgetTotal ? clamp(spent / budgetTotal) : 0,
    paidPct: budgetTotal ? clamp(paid / budgetTotal) : 0,
  };
}

// ── Gifts ──────────────────────────────────────────────────────────────────

export const METHOD_META: Record<GiftMethod, { label: string; icon: LucideIcon }> = {
  envelope: { label: "Envelope", icon: Mail },
  cash: { label: "Cash", icon: Banknote },
  transfer: { label: "PayNow", icon: Send },
  others: { label: "Others", icon: Coins },
};

// ── Days ───────────────────────────────────────────────────────────────────

export function dayLabel(label: string | null | undefined, index: number): string {
  return label?.trim() || `Day ${index + 1}`;
}
