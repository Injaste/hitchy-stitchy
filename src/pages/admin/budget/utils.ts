import { differenceInCalendarDays, format, parseISO } from "date-fns"

import type { BudgetBucket, Expense, ExpenseStatus } from "./types"

const numFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })

/** "S$12,000" — SGD with no cents (wedding amounts are whole). */
export function formatSGD(n: number): string {
  return `S$${numFmt.format(Math.round(n))}`
}

/** "12,000" — bare grouped number, for tight sheet cells. */
export function formatNum(n: number): string {
  return numFmt.format(Math.round(n))
}

export function statusOf(e: Expense): ExpenseStatus {
  if (e.paid <= 0) return "unpaid"
  if (e.paid >= e.amount) return "paid"
  return "partial"
}

/** Left-stripe colour as a linear payment-progress ramp: destructive (0%) →
 *  warning (50%) → success (toward 100%). Fully paid returns null (no stripe).
 *  color-mix in OKLCH keeps it tied to the colour tokens. */
export function stripeColor(e: Expense): string | null {
  if (e.amount <= 0) return null
  const p = Math.max(0, Math.min(1, e.paid / e.amount))
  if (p >= 1) return null

  if (p <= 0.5) {
    const pct = (p / 0.5) * 100
    return `color-mix(in oklch, var(--color-warning) ${pct}%, var(--color-destructive))`
  }
  const pct = ((p - 0.5) / 0.5) * 100
  return `color-mix(in oklch, var(--color-success) ${pct}%, var(--color-warning))`
}

export type DueUrgency = "overdue" | "soon" | "upcoming" | "settled" | "none"

/** Due-date urgency relative to today. Settled rows drop their urgency. */
export function dueInfo(e: Expense): { urgency: DueUrgency; label: string } {
  if (statusOf(e) === "paid") return { urgency: "settled", label: "" }
  if (!e.due_at) return { urgency: "none", label: "" }

  const days = differenceInCalendarDays(parseISO(e.due_at), new Date())
  if (days < 0) return { urgency: "overdue", label: `${Math.abs(days)}d` }
  if (days === 0) return { urgency: "soon", label: "Today" }
  if (days <= 14) return { urgency: "soon", label: `${days}d` }
  return { urgency: "upcoming", label: format(parseISO(e.due_at), "d MMM") }
}

const URGENCY_RANK: Record<DueUrgency, number> = {
  overdue: 0,
  soon: 1,
  upcoming: 2,
  none: 3,
  settled: 4,
}

/** Order by urgency (overdue → settled); within a tier, earliest due then largest. */
export function sortExpenses(list: Expense[]): Expense[] {
  return [...list].sort((a, b) => {
    const ra = URGENCY_RANK[dueInfo(a).urgency]
    const rb = URGENCY_RANK[dueInfo(b).urgency]
    if (ra !== rb) return ra - rb
    if (a.due_at && b.due_at && a.due_at !== b.due_at)
      return a.due_at < b.due_at ? -1 : 1
    return b.amount - a.amount
  })
}

export interface BudgetSummary {
  budgetTotal: number | null
  spent: number
  paid: number
  /** budget − spent; null when no budget is set. */
  remaining: number | null
  /** spent − paid; what's still owed to vendors. */
  outstanding: number
  /** Owed amount on expenses due within 14 days (incl. overdue). */
  dueSoon: number
  /** 0..1 of budget; 0 when no budget. */
  spentPct: number
  paidPct: number
}

// ── Per-day bucket accessors ────────────────────────────────────────────────
// Pure derivations over the budget buckets so the view/queries stay thin and
// don't re-implement the same day lookups (mirrors timeline's utils.ts).

/** Whole-wedding cap: the sum of each day's set cap, or null when none are set. */
export function grandBudget(buckets: BudgetBucket[]): number | null {
  const caps = buckets
    .map((b) => b.budget_total)
    .filter((t): t is number => t !== null)
  return caps.length ? caps.reduce((a, b) => a + b, 0) : null
}

/** A day's cap — null when the day has no bucket yet, or its cap is unset. */
export function dayBudgetTotal(
  buckets: BudgetBucket[],
  dayId: string | null,
): number | null {
  return buckets.find((b) => b.day_id === dayId)?.budget_total ?? null
}

/** Expenses filed under a given day (resolved through their bucket). */
export function expensesForDay(
  expenses: Expense[],
  buckets: BudgetBucket[],
  dayId: string | null,
): Expense[] {
  const dayOf = new Map(buckets.map((b) => [b.id, b.day_id]))
  return expenses.filter((e) => dayOf.get(e.budget_id) === dayId)
}

/** Replace the bucket for a day (one per day) or append it — optimistic cache shape. */
export function upsertBucket(
  buckets: BudgetBucket[],
  bucket: BudgetBucket,
): BudgetBucket[] {
  return buckets.some((b) => b.day_id === bucket.day_id)
    ? buckets.map((b) => (b.day_id === bucket.day_id ? bucket : b))
    : [...buckets, bucket]
}

export function computeSummary(
  expenses: Expense[],
  budgetTotal: number | null,
): BudgetSummary {
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const paid = expenses.reduce((sum, e) => sum + e.paid, 0)

  const dueSoon = expenses.reduce((sum, e) => {
    const { urgency } = dueInfo(e)
    return urgency === "overdue" || urgency === "soon"
      ? sum + (e.amount - e.paid)
      : sum
  }, 0)

  const clamp = (n: number) => Math.max(0, Math.min(1, n))

  return {
    budgetTotal,
    spent,
    paid,
    remaining: budgetTotal === null ? null : budgetTotal - spent,
    outstanding: spent - paid,
    dueSoon,
    spentPct: budgetTotal ? clamp(spent / budgetTotal) : 0,
    paidPct: budgetTotal ? clamp(paid / budgetTotal) : 0,
  }
}
