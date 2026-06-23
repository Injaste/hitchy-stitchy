export type ExpenseStatus = "paid" | "partial" | "unpaid";

export interface Expense {
  id: string;
  event_id: string;
  budget_id: string;
  item: string;
  vendor_name: string | null;
  payer: string | null;
  amount: number;
  paid: number;
  due_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetSummary {
  budgetTotal: number | null;
  spent: number;
  paid: number;
  remaining: number | null;
  outstanding: number;
  dueSoon: number;
  spentPct: number;
  paidPct: number;
}
