import { useState, useEffect } from "react";
import BudgetSummary from "@/pages/home/features/budget/BudgetSummary";
import ExpensesSheet from "@/pages/home/features/budget/ExpensesSheet";
import { computeSummary, sortExpenses } from "../../features/utils";
import type { Expense } from "../../features/types";

// The real budget surface — BudgetSummary (total / remaining / outstanding +
// progress bar) over the real ExpensesSheet / ExpenseRow, fed sample SG
// expenses. Payments come in batches, so each row's `paid` climbs across phases:
// the real stripeColor ramp (red → amber → green) plays out on the left border,
// and the summary's progress bar + figures settle with it.
const BUDGET_TOTAL = 55000;

const mk = (
  id: string,
  item: string,
  vendor: string,
  payer: string,
  amount: number,
  due_at: string,
): Expense => ({
  id,
  event_id: "demo",
  budget_id: "demo",
  item,
  vendor_name: vendor,
  payer,
  amount,
  paid: 0,
  due_at,
  notes: null,
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
});

// Sorted ONCE by the real rule (urgency → due → amount); rows then settle in
// place (no live re-sort, so nothing jumps). An Indian wedding's vendors.
const ORDER = sortExpenses([
  mk("e1", "Banquet & catering · 300 pax", "Saffron Banquets", "Groom's side", 32000, "2026-08-02"),
  mk("e2", "Mandap & floral décor", "Bloom & Mandap", "Shared", 6800, "2026-07-20"),
  mk("e3", "Bridal mehndi & makeup", "Henna by Anjali", "Bride's side", 3200, "2026-07-15"),
  mk("e4", "Sangeet night band", "Dhol Beats", "Shared", 2800, "2026-07-28"),
]);

const TOTAL_SPENT = ORDER.reduce((s, e) => s + e.amount, 0);

// Paid amount per expense, batch by batch: deposits → progress payments. The
// banquet (e1) is never fully settled in the loop, so there's always a balance
// owing and the footer always shows how much is left. Crosses the stripe ramp
// (low % red, ~half amber, near-full green).
const PHASES: Record<string, number>[] = [
  { e1: 4000, e2: 1000, e3: 1500, e4: 500 },
  { e1: 4000, e2: 6800, e3: 1500, e4: 500 },
  { e1: 16000, e2: 6800, e3: 3200, e4: 1400 },
  { e1: 24000, e2: 6800, e3: 3200, e4: 2800 },
];

export function BudgetShowcase() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const advance = (p: number) => {
      const last = p >= PHASES.length - 1;
      timeout = setTimeout(
        () => {
          const next = last ? 0 : p + 1;
          setPhase(next);
          advance(next);
        },
        last ? 2600 : 1600,
      );
    };
    advance(phase);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paidBy = PHASES[phase];
  const expenses = ORDER.map((e) => ({ ...e, paid: paidBy[e.id] ?? 0 }));
  const totalPaid = expenses.reduce((s, e) => s + e.paid, 0);
  const summary = computeSummary(expenses, BUDGET_TOTAL);

  return (
    <div className="space-y-3">
      <BudgetSummary summary={summary} />
      <ExpensesSheet
        expenses={expenses}
        totalSpent={TOTAL_SPENT}
        totalPaid={totalPaid}
        onRowClick={() => {}}
      />
    </div>
  );
}
