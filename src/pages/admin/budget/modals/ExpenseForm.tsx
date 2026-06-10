import type { FC } from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"

import { FieldGroup } from "@/components/ui/field"
import {
  TextField,
  TextareaField,
  DateField,
  FormBody,
} from "@/components/custom/form"

import { expenseFormSchema, type ExpenseFormValues } from "../types"

// Schema errors mapped to per-field messages for FieldShell. The .refine
// (paid ≤ amount) surfaces under the `paid` field.
function validateExpenseForm(value: unknown) {
  const parsed = expenseFormSchema.safeParse(value)
  if (parsed.success) return undefined

  const fields: Record<string, { message: string }> = {}
  const properties = z.treeifyError(parsed.error).properties ?? {}
  for (const [key, tree] of Object.entries(properties)) {
    if (tree?.errors?.length) fields[key] = { message: tree.errors[0] }
  }
  return Object.keys(fields).length ? { fields } : undefined
}

interface UseExpenseFormOpts {
  defaultValues?: Partial<ExpenseFormValues>
  onSubmit: (values: ExpenseFormValues) => void
}

export const useExpenseForm = ({ defaultValues, onSubmit }: UseExpenseFormOpts) =>
  useForm({
    defaultValues: {
      item: defaultValues?.item ?? "",
      vendor_name: defaultValues?.vendor_name ?? "",
      payer: defaultValues?.payer ?? "",
      amount: defaultValues?.amount ?? 0,
      paid: defaultValues?.paid ?? 0,
      due_at: (defaultValues?.due_at ?? null) as string | null,
      notes: defaultValues?.notes ?? "",
    },
    validators: {
      onSubmit: ({ value }) => validateExpenseForm(value),
      onChange: ({ value }) => validateExpenseForm(value),
    },
    onSubmit: ({ value }) => {
      onSubmit(expenseFormSchema.parse(value))
    },
  })

interface ExpenseFormProps {
  /** Focus the Paid field on open (edit flow — usually updating a payment). */
  autoFocusPaid?: boolean
}

const ExpenseForm: FC<ExpenseFormProps> = ({ autoFocusPaid }) => (
  <FormBody>
    <FieldGroup>
      <TextField
        name="item"
        label="Item"
        placeholder="e.g. Hall buffet — 1,000 pax"
      />
      <TextField
        name="vendor_name"
        label="Vendor"
        optional
        placeholder="e.g. Sedap Catering"
      />
      <TextField
        name="payer"
        label="Paid by"
        optional
        placeholder="e.g. Bride's family"
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          name="amount"
          label="Amount (S$)"
          type="number"
          inputMode="decimal"
          placeholder="0"
        />
        <TextField
          name="paid"
          label="Paid (S$)"
          type="number"
          inputMode="decimal"
          placeholder="0"
          autoFocus={autoFocusPaid}
        />
      </div>
      <DateField name="due_at" label="Due date" optional />
      <TextareaField
        name="notes"
        label="Notes"
        optional
        rows={2}
        placeholder="Deposit paid, balance on collection…"
      />
    </FieldGroup>
  </FormBody>
)

export default ExpenseForm
