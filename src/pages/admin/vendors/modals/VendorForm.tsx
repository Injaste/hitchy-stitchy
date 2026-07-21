import { createElement } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { FieldGroup } from "@/components/ui/field";
import {
  TextField,
  TextareaField,
  SelectField,
  PhoneField,
  AssigneeField,
  FormBody,
} from "@/components/custom/form";

import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import { dayLabel } from "../../days/utils";
import { CATEGORIES } from "../utils";
import { vendorFormSchema, type VendorFormValues } from "../types";

// Schema errors mapped to per-field messages for FieldShell.
function validateVendorForm(value: unknown) {
  const parsed = vendorFormSchema.safeParse(value);
  if (parsed.success) return undefined;

  const fields: Record<string, { message: string }> = {};
  const properties = z.treeifyError(parsed.error).properties ?? {};
  for (const [key, tree] of Object.entries(properties)) {
    if (tree?.errors?.length) fields[key] = { message: tree.errors[0] };
  }
  return Object.keys(fields).length ? { fields } : undefined;
}

interface UseVendorFormOpts {
  defaultValues?: Partial<VendorFormValues>;
  onSubmit: (values: VendorFormValues) => void;
}

export const useVendorForm = ({ defaultValues, onSubmit }: UseVendorFormOpts) =>
  useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      category: defaultValues?.category ?? "",
      phone: (defaultValues?.phone ?? "") as string | null,
      email: (defaultValues?.email ?? "") as string | null,
      notes: (defaultValues?.notes ?? "") as string | null,
      day_ids: defaultValues?.day_ids ?? [],
    },
    validators: {
      onSubmit: ({ value }) => validateVendorForm(value),
      onChange: ({ value }) => validateVendorForm(value),
    },
    onSubmit: ({ value }) => {
      onSubmit(vendorFormSchema.parse(value));
    },
  });

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({
  value: c.value,
  label: c.label,
  icon: createElement(c.icon, { className: "size-4" }),
}));

const VendorForm = () => {
  // Multi-day events only: a vendor can work none / one / many days. Single-day
  // events have nothing to choose, so the field is hidden (the lone day is
  // implicit) — same rule GiftForm uses for its day select.
  const { days } = useActiveEventDay();
  const dayItems = days.map((day, index) => ({
    id: day.id,
    label: dayLabel(day.label, index),
  }));

  return (
    <FormBody>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            name="name"
            label="Vendor name"
            placeholder="e.g. Golden Moments Photography"
          />
          <SelectField
            name="category"
            label="Category"
            placeholder="Select a category"
            options={CATEGORY_OPTIONS}
          />
        </div>

        <PhoneField name="phone" label="Phone" optional />

        <TextField
          name="email"
          label="Email"
          optional
          placeholder="name@example.com"
        />

        {days.length > 1 && (
          <AssigneeField
            name="day_ids"
            label="Booked for"
            optional
            items={dayItems}
          />
        )}

        <TextareaField
          name="notes"
          label="Notes"
          optional
          rows={3}
          placeholder={"- Item one\n- Item two\n**Bold text**, *italic*"}
          description="Supports markdown — **bold**, *italic*, - lists, 1. numbered"
        />
      </FieldGroup>
    </FormBody>
  );
};

export default VendorForm;
