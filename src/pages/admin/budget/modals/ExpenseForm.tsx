import { useEffect, type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { Plus } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
  TextField,
  TextareaField,
  DateField,
  SelectField,
  FormBody,
} from "@/components/custom/form";
import { useFormShell } from "@/components/custom/form/form-context";

import { useAccess } from "../../hooks/useAccess";
import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import { usePlan } from "../../hooks/usePlan";
import { dayLabel } from "../../days/utils";
import { useVendorsQuery } from "../../vendors/queries";
import { sortVendors } from "../../vendors/utils";
import { useExpenseModalStore } from "../hooks/useExpenseModalStore";
import { expenseFormSchema, type ExpenseFormValues } from "../types";

// Money is cents at most — drop any digits past 2 decimals as they're typed
// (1000.12111 → 1000.12). Only trims the overflow; partial entries like "1000."
// or "1000.1" are left untouched so typing stays natural.
const trimToCents = (v: string) => v.replace(/(\.\d{2})\d+/, "$1");

// Schema errors mapped to per-field messages for FieldShell. The .refine
// (paid ≤ amount) surfaces under the `paid` field.
function validateExpenseForm(value: unknown) {
  const parsed = expenseFormSchema.safeParse(value);
  if (parsed.success) return undefined;

  const fields: Record<string, { message: string }> = {};
  const properties = z.treeifyError(parsed.error).properties ?? {};
  for (const [key, tree] of Object.entries(properties)) {
    if (tree?.errors?.length) fields[key] = { message: tree.errors[0] };
  }
  return Object.keys(fields).length ? { fields } : undefined;
}

interface UseExpenseFormOpts {
  defaultValues?: Partial<ExpenseFormValues>;
  onSubmit: (values: ExpenseFormValues) => void;
}

export const useExpenseForm = ({
  defaultValues,
  onSubmit,
}: UseExpenseFormOpts) =>
  useForm({
    defaultValues: {
      item: defaultValues?.item ?? "",
      vendor_id: defaultValues?.vendor_id ?? null,
      payer: defaultValues?.payer ?? "",
      amount: defaultValues?.amount ?? 0,
      paid: defaultValues?.paid ?? 0,
      due_at: (defaultValues?.due_at ?? null) as string | null,
      notes: defaultValues?.notes ?? "",
      day_id: defaultValues?.day_id ?? null,
    },
    validators: {
      onSubmit: ({ value }) => validateExpenseForm(value),
      onChange: ({ value }) => validateExpenseForm(value),
    },
    onSubmit: ({ value }) => {
      onSubmit(expenseFormSchema.parse(value));
    },
  });

interface ExpenseFormProps {
  /** Focus the Paid field on open (edit flow — usually updating a payment). */
  autoFocusPaid?: boolean;
  /** Surface the Day select. Only for callers with no day context of their own
   *  (a vendor's detail) — the Budget page takes the day from its day tabs, so
   *  showing it there would duplicate the tab the user just clicked. */
  showDay?: boolean;
}

const ExpenseForm: FC<ExpenseFormProps> = ({ autoFocusPaid, showDay }) => {
  const { data } = useVendorsQuery();
  const { days, multiDay, activeDayId } = useActiveEventDay();
  const { form } = useFormShell();
  const { canCreate } = useAccess();
  const { canUseFeature } = usePlan();
  const createVendorId = useExpenseModalStore((s) => s.createVendorId);
  const openVendorCreate = useExpenseModalStore((s) => s.openVendorCreate);
  const closeVendorCreate = useExpenseModalStore((s) => s.closeVendorCreate);
  const pendingVendorId = useExpenseModalStore((s) => s.pendingVendorId);
  const setPendingVendorId = useExpenseModalStore((s) => s.setPendingVendorId);

  // A vendor was just added from the stacked dialog: select it and dismiss that
  // dialog. Doing it here rather than in the dialog keeps the form the only
  // writer of its own fields.
  useEffect(() => {
    if (!pendingVendorId) return;
    form.setFieldValue("vendor_id", pendingVendorId);
    setPendingVendorId(null);
    closeVendorCreate();
  }, [pendingVendorId, form, setPendingVendorId, closeVendorCreate]);

  // Adding a vendor inline needs the vendors module (Pro+) AND write rights on
  // it — an Admin who can spend but not manage the roster shouldn't get a button
  // the server would reject.
  //
  // Hidden when the modal was opened FROM a vendor: that vendor is the reason
  // this form exists, so offering to create another one invites unlinking the
  // expense from the detail you'd be sent back to. The select itself stays
  // editable — correcting a mis-click is fair; starting a new vendor isn't.
  const canAddVendor =
    canUseFeature("vendors") && canCreate("vendors") && !createVendorId;

  const vendorOptions = sortVendors(data?.vendors ?? []).map((vendor) => ({
    value: vendor.id,
    label: vendor.name,
  }));
  const dayOptions = days.map((day, index) => ({
    value: day.id,
    label: dayLabel(day.label, index),
  }));

  return (
    <FormBody>
      <FieldGroup>
        <TextField
          name="item"
          label="Item"
          placeholder="e.g. Hall buffet — 1,000 pax"
        />
        {/* Ties to a CRM vendor (or none) — no free-text, so a vendor's spend
            derives cleanly from its linked expenses. The label action covers the
            gap that creates: with no free-text, a vendor missing from the list
            used to be a dead end mid-form ("No vendors yet" especially). */}
        <SelectField
          name="vendor_id"
          label="Vendor"
          optional
          nullable
          placeholder={
            vendorOptions.length ? "Select a vendor" : "No vendors yet"
          }
          options={vendorOptions}
          labelAction={
            canAddVendor && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() =>
                  openVendorCreate(form.state.values.day_id ?? activeDayId)
                }
              >
                <Plus className="size-3.5" />
                Vendor
              </Button>
            )
          }
        />
        {showDay && multiDay && (
          <SelectField
            name="day_id"
            label="Day"
            options={dayOptions}
            placeholder="Select a day"
          />
        )}
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
          step="0.01"
          placeholder="0"
          transform={trimToCents}
        />
        <TextField
          name="paid"
          label="Paid (S$)"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0"
          autoFocus={autoFocusPaid}
          transform={trimToCents}
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
  );
};

export default ExpenseForm;
