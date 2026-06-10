// Budget API — real Supabase backend (migration 20260610000001).
// Reads are RLS-gated selects (event_expenses + event_budget, both gated on
// budget:read); writes go through the create_expense / update_expense /
// delete_expense / update_budget RPCs.

import { supabase } from "@/lib/supabase";
import type {
  CreateExpensePayload,
  Expense,
  UpdateExpensePayload,
} from "./types";

export interface BudgetData {
  budgetTotal: number | null;
  expenses: Expense[];
}

const EXPENSE_FIELDS =
  "id, event_id, item, vendor_name, payer, amount, paid, due_at, notes, created_at, updated_at";

export async function fetchBudget(eventId: string): Promise<BudgetData> {
  const [expensesRes, budgetRes] = await Promise.all([
    supabase
      .from("event_expenses")
      .select(EXPENSE_FIELDS)
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
    supabase
      .from("event_budget")
      .select("budget_total")
      .eq("event_id", eventId)
      .maybeSingle(),
  ]);

  if (expensesRes.error) throw new Error(expensesRes.error.message);
  if (budgetRes.error) throw new Error(budgetRes.error.message);

  return {
    budgetTotal: budgetRes.data?.budget_total ?? null,
    expenses: (expensesRes.data ?? []) as Expense[],
  };
}

export async function createExpense(
  eventId: string,
  payload: CreateExpensePayload,
): Promise<Expense> {
  const { data, error } = await supabase.rpc("create_expense", {
    p_event_id: eventId,
    p_item: payload.item,
    p_vendor_name: payload.vendor_name,
    p_payer: payload.payer,
    p_amount: payload.amount,
    p_paid: payload.paid,
    p_due_at: payload.due_at,
    p_notes: payload.notes,
  });

  if (error) throw new Error(error.message);
  return data as Expense;
}

export async function updateExpense(
  payload: UpdateExpensePayload,
): Promise<Expense> {
  const { data, error } = await supabase.rpc("update_expense", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_item: payload.item,
    p_vendor_name: payload.vendor_name,
    p_payer: payload.payer,
    p_amount: payload.amount,
    p_paid: payload.paid,
    p_due_at: payload.due_at,
    p_notes: payload.notes,
  });

  if (error) throw new Error(error.message);
  return data as Expense;
}

export async function deleteExpense(
  eventId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase.rpc("delete_expense", {
    p_event_id: eventId,
    p_id: id,
  });

  if (error) throw new Error(error.message);
}

export async function updateBudget(
  eventId: string,
  amount: number | null,
): Promise<number | null> {
  const { data, error } = await supabase.rpc("update_budget", {
    p_event_id: eventId,
    p_amount: amount,
  });

  if (error) throw new Error(error.message);
  return (data as { budget_total: number | null } | null)?.budget_total ?? null;
}
