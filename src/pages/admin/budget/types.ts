import { z } from "zod"

export type ExpenseStatus = "paid" | "partial" | "unpaid"

export const FILTER_PILLS = [
  { value: "all", label: "All", variant: "secondary" },
  { value: "outstanding", label: "Outstanding", variant: "warning" },
  { value: "overdue", label: "Overdue", variant: "destructive" },
  { value: "paid", label: "Paid", variant: "success" },
] as const

export type ExpenseFilter = (typeof FILTER_PILLS)[number]["value"]

export interface Expense {
  id: string
  event_id: string
  /** The (event, day) bucket this expense is filed under — maps to a day via the buckets list. */
  budget_id: string
  item: string
  /** Snapshot label of the linked vendor (or a legacy free-text name). */
  vendor_name: string | null
  /** Link to a CRM vendor; a vendor's spend derives from its linked expenses. */
  vendor_id: string | null
  payer: string | null
  amount: number
  paid: number
  due_at: string | null // yyyy-MM-dd
  notes: string | null
  created_at: string
  updated_at: string
}

export const expenseFormSchema = z
  .object({
    item: z.string().min(1, "Item is required").max(200, "Item is too long"),
    // The vendor is picked from the CRM (a real vendor id) or left unset — no
    // free-text. The snapshot label (vendor_name) is resolved from this at submit.
    vendor_id: z.string().nullable(),
    // Which day's budget bucket this expense files under. Normally null — the
    // Budget page takes the day from its day tabs. It's only surfaced as a field
    // when the modal is opened somewhere with no day context (a vendor's detail),
    // where guessing the ambient day would be surprising.
    day_id: z.string().nullable(),
    payer: z
      .string()
      .max(100, "Name is too long")
      .transform((v) => (v.trim() ? v.trim() : null)),
    amount: z.coerce
      .number()
      .min(0, "Can't be negative")
      .max(99_999_999, "Amount is too high"),
    paid: z.coerce
      .number()
      .min(0, "Can't be negative")
      .max(99_999_999, "Paid is too high"),
    due_at: z.string().nullable(),
    notes: z
      .string()
      .max(1000, "Notes are too long")
      .transform((v) => (v.trim() ? v.trim() : null)),
  })
  .refine((d) => d.paid <= d.amount, {
    path: ["paid"],
    message: "Paid can't exceed the amount",
  })

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>

/** A per-day budget bucket (event_budget row): one per (event, day). `budget_total`
 *  is null until a cap is set. Expenses point here via `Expense.budget_id`. */
export interface BudgetBucket {
  id: string
  day_id: string
  budget_total: number | null
}

// vendor_name isn't a form field — it's the snapshot the modal resolves from the
// selected vendor_id (so the label survives a vendor delete, which nulls vendor_id).
export interface CreateExpensePayload extends ExpenseFormValues {
  vendor_name: string | null
}

export interface UpdateExpensePayload extends CreateExpensePayload {
  event_id: string
  id: string
}
