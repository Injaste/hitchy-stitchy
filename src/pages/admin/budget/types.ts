import { z } from "zod"

export type ExpenseStatus = "paid" | "partial" | "unpaid"

export interface Expense {
  id: string
  event_id: string
  item: string
  vendor_name: string | null
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
    vendor_name: z
      .string()
      .max(200, "Vendor is too long")
      .transform((v) => (v.trim() ? v.trim() : null)),
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

export interface CreateExpensePayload extends ExpenseFormValues {}

export interface UpdateExpensePayload extends ExpenseFormValues {
  event_id: string
  id: string
}
