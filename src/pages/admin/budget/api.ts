// Budget API — per-day buckets (migration 20260612000101). event_budget is now
// one row per (event, day); event_expenses.budget_id points at its bucket. Reads
// are RLS-gated selects (super-admin only); writes go through the create_expense
// / update_expense / delete_expense / update_budget RPCs, each carrying the day.

import { supabase } from "@/lib/supabase";
import type {
  BudgetBucket,
  CreateExpensePayload,
  Expense,
  UpdateExpensePayload,
} from "./types";

export interface BudgetData {
  /** Per-day budget buckets — caps live here; expenses map to a day via these. */
  buckets: BudgetBucket[];
  expenses: Expense[];
}

const EXPENSE_FIELDS =
  "id, event_id, budget_id, item, vendor_name, payer, amount, paid, due_at, notes, created_at, updated_at";

export async function fetchBudget(eventId: string): Promise<BudgetData> {
  const [expensesRes, bucketsRes] = await Promise.all([
    supabase
      .from("event_expenses")
      .select(EXPENSE_FIELDS)
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
    supabase
      .from("event_budget")
      .select("id, day_id, budget_total")
      .eq("event_id", eventId),
  ]);

  if (expensesRes.error) throw new Error(expensesRes.error.message);
  if (bucketsRes.error) throw new Error(bucketsRes.error.message);

  return {
    buckets: (bucketsRes.data ?? []) as BudgetBucket[],
    expenses: (expensesRes.data ?? []) as Expense[],
  };
}

export async function createExpense(
  eventId: string,
  payload: CreateExpensePayload,
  dayId: string | null,
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
    p_day_id: dayId,
  });

  if (error) throw new Error(error.message);
  return data as Expense;
}

export async function updateExpense(
  payload: UpdateExpensePayload,
  dayId: string | null,
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
    p_day_id: dayId,
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
  dayId: string | null,
): Promise<BudgetBucket> {
  const { data, error } = await supabase.rpc("update_budget", {
    p_event_id: eventId,
    p_amount: amount,
    p_day_id: dayId,
  });

  if (error) throw new Error(error.message);
  return data as BudgetBucket;
}
