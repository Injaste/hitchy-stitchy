import { useState, useEffect } from "react";
import ExpensesSheet from "@/pages/admin/budget/components/ExpensesSheet";
import { sortExpenses } from "@/pages/admin/budget/utils";
import type { Expense } from "@/pages/admin/budget/types";

// The real budget sheet (ExpensesSheet / ExpenseRow), fed sample SG expenses.
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

// Sorted ONCE by the real sortExpenses rule (urgency → due date → amount) so the
// displayed order is faithful; rows then settle in place (no live re-sort, so
// nothing jumps). Today is 2026-06, all upcoming → earliest due first.
const ORDER = sortExpenses([
  mk("e1", "Hotel banquet · 30 tables", "Marina Bay Ballroom", "Groom's side", 38800, "2026-08-02"),
  mk("e2", "Actual-day photo & video", "Lumière Weddings", "Shared", 4200, "2026-07-12"),
  mk("e3", "Bridal MUA & gown", "Atelier Sui", "Bride's side", 2880, "2026-07-20"),
  mk("e4", "Live band (4-pc)", "The Sundown Trio", "Shared", 2600, "2026-07-28"),
  mk("e5", "Lion dance troupe", "Sing Heng", "Groom's side", 1288, "2026-08-02"),
  mk("e6", "Bridal car & florals", "Bloom & Drive", "Bride's side", 880, "2026-08-01"),
]);

const TOTAL_SPENT = ORDER.reduce((s, e) => s + e.amount, 0);

// How many (from the top) have settled. Climbs, holds, resets.
const STEPS = [1, 2, 3, 4, 5];

export function BudgetShowcase() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const advance = (s: number) => {
      const last = s >= STEPS.length - 1;
      timeout = setTimeout(
        () => {
          const next = last ? 0 : s + 1;
          setStep(next);
          advance(next);
        },
        last ? 2600 : 1500,
      );
    };
    advance(step);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paidCount = STEPS[step];
  const expenses = ORDER.map((e, i) => ({
    ...e,
    paid: i < paidCount ? e.amount : 0,
  }));
  const totalPaid = expenses.reduce((s, e) => s + e.paid, 0);

  return (
    <ExpensesSheet
      expenses={expenses}
      totalSpent={TOTAL_SPENT}
      totalPaid={totalPaid}
      onRowClick={() => {}}
    />
  );
}
