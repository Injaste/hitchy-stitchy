import { createElement } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { FieldGroup } from "@/components/ui/field";
import {
  TextField,
  TextareaField,
  SelectField,
  PhoneField,
  FormBody,
} from "@/components/custom/form";

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
      contact_phone: (defaultValues?.contact_phone ?? "") as string | null,
      contact_email: (defaultValues?.contact_email ?? "") as string | null,
      notes: (defaultValues?.notes ?? "") as string | null,
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

const VendorForm = () => (
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

      <PhoneField name="contact_phone" label="Phone" optional />

      <TextField
        name="contact_email"
        label="Email"
        optional
        placeholder="name@example.com"
      />

      <TextareaField
        name="notes"
        label="Notes"
        optional
        rows={2}
        placeholder="Package, deposit status, anything to remember…"
      />
    </FieldGroup>
  </FormBody>
);

export default VendorForm;
