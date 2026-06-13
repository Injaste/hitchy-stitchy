import { useForm } from "@tanstack/react-form";
import { Banknote, Coins, Mail, Send } from "lucide-react";
import { z } from "zod";

import { FieldGroup } from "@/components/ui/field";
import {
  TextField,
  TextareaField,
  SelectField,
  FormBody,
} from "@/components/custom/form";

import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import { dayLabel } from "../../days/utils";
import { giftFormSchema, type GiftFormValues } from "../types";

// Schema errors mapped to per-field messages for FieldShell.
function validateGiftForm(value: unknown) {
  const parsed = giftFormSchema.safeParse(value);
  if (parsed.success) return undefined;

  const fields: Record<string, { message: string }> = {};
  const properties = z.treeifyError(parsed.error).properties ?? {};
  for (const [key, tree] of Object.entries(properties)) {
    if (tree?.errors?.length) fields[key] = { message: tree.errors[0] };
  }
  return Object.keys(fields).length ? { fields } : undefined;
}

interface UseGiftFormOpts {
  defaultValues?: Partial<GiftFormValues>;
  onSubmit: (values: GiftFormValues) => void;
}

export const useGiftForm = ({ defaultValues, onSubmit }: UseGiftFormOpts) =>
  useForm({
    defaultValues: {
      given_by: defaultValues?.given_by ?? "",
      amount: defaultValues?.amount ?? 0,
      method: defaultValues?.method ?? "envelope",
      notes: (defaultValues?.notes ?? "") as string | null,
      day_id: defaultValues?.day_id ?? "",
    },
    validators: {
      onSubmit: ({ value }) => validateGiftForm(value),
      onChange: ({ value }) => validateGiftForm(value),
    },
    onSubmit: ({ value }) => {
      onSubmit(giftFormSchema.parse(value));
    },
  });

const METHOD_OPTIONS = [
  { value: "envelope", label: "Envelope", icon: <Mail className="size-4" /> },
  { value: "cash", label: "Cash", icon: <Banknote className="size-4" /> },
  { value: "transfer", label: "PayNow", icon: <Send className="size-4" /> },
  { value: "others", label: "Others", icon: <Coins className="size-4" /> },
];

const GiftForm = () => {
  const { days } = useActiveEventDay();
  const dayOptions = days.map((day, index) => ({
    value: day.id,
    label: dayLabel(day.label, index),
  }));

  return (
    <FormBody>
      <FieldGroup>
        <TextField
          name="given_by"
          label="From"
          placeholder="e.g. Tan Wei Ming or Uncle Lim"
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            name="amount"
            label="Amount (S$)"
            type="number"
            inputMode="decimal"
            placeholder="0"
          />
          <SelectField
            name="method"
            label="Received as"
            options={METHOD_OPTIONS}
          />
        </div>

        {days.length > 1 && (
          <SelectField name="day_id" label="Day" options={dayOptions} />
        )}

        <TextareaField
          name="notes"
          label="Notes"
          optional
          rows={2}
          placeholder="Optional…"
        />
      </FieldGroup>
    </FormBody>
  );
};

export default GiftForm;
