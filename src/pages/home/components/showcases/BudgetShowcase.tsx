import { useState, useEffect } from "react";
import BudgetSummary from "@/pages/admin/budget/components/BudgetSummary";
import ExpensesSheet from "@/pages/admin/budget/components/ExpensesSheet";
import { computeSummary, sortExpenses } from "@/pages/admin/budget/utils";
import type { Expense } from "@/pages/admin/budget/types";

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
// place (no live re-sort, so nothing jumps).
const ORDER = sortExpenses([
  mk("e1", "Hotel banquet · 30 tables", "Marina Bay Ballroom", "Groom's side", 38800, "2026-08-02"),
  mk("e2", "Actual-day photo & video", "Lumière Weddings", "Shared", 4200, "2026-07-12"),
  mk("e3", "Bridal MUA & gown", "Atelier Sui", "Bride's side", 2880, "2026-07-20"),
  mk("e4", "Live band (4-pc)", "The Sundown Trio", "Shared", 2600, "2026-07-28"),
]);

const TOTAL_SPENT = ORDER.reduce((s, e) => s + e.amount, 0);

// Paid amount per expense, batch by batch: deposits → progress payments → fully
// settled. Crosses the stripe ramp (low % red, ~half amber, full green/none).
const PHASES: Record<string, number>[] = [
  { e1: 5000, e2: 0, e3: 1000, e4: 800 },
  { e1: 5000, e2: 4200, e3: 1000, e4: 800 },
  { e1: 19400, e2: 4200, e3: 2880, e4: 1300 },
  { e1: 38800, e2: 4200, e3: 2880, e4: 2600 },
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
