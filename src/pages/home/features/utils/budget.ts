import { differenceInCalendarDays, format, parseISO } from "date-fns";

import type { Expense, ExpenseStatus, BudgetSummary } from "../types";

export type { BudgetSummary };

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

export function computeSummary(
  expenses: Expense[],
  budgetTotal: number | null,
): BudgetSummary {
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paid = expenses.reduce((sum, e) => sum + e.paid, 0);

  const dueSoon = expenses.reduce((sum, e) => {
    const { urgency } = dueInfo(e);
    return urgency === "overdue" || urgency === "soon"
      ? sum + (e.amount - e.paid)
      : sum;
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
