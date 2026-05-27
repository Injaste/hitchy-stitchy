import { useForm } from "@tanstack/react-form";

import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field";
import { DialogBody } from "@/components/ui/dialog";
import {
  TextareaField,
  SelectField,
  type SelectFieldOption,
} from "@/components/custom/form";
import FieldShell from "@/components/custom/form/fields/FieldShell";
import { useFormShell } from "@/components/custom/form/form-context";

import { roleFormSchema, CATEGORY_LABELS, type RoleFormValues } from "../types";

function autoShortName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.map((w) => w[0]).join("").toUpperCase().slice(0, 10);
}

const SELECTABLE_CATEGORIES = Object.keys(
  CATEGORY_LABELS,
) as (keyof typeof CATEGORY_LABELS)[];

const CATEGORY_OPTIONS: SelectFieldOption[] = SELECTABLE_CATEGORIES.map(
  (c) => ({
    value: c,
    label: CATEGORY_LABELS[c],
    disabled: c === "root",
  }),
);

interface UseRoleFormOpts {
  defaultValues?: Partial<RoleFormValues>;
  onSubmit: (values: RoleFormValues) => void;
}

export const useRoleForm = ({ defaultValues, onSubmit }: UseRoleFormOpts) =>
  useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      short_name: defaultValues?.short_name ?? "",
      category: defaultValues?.category ?? "general",
      description: defaultValues?.description ?? "",
    },
    validators: {
      onSubmit: roleFormSchema,
      onChange: roleFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(roleFormSchema.parse(value));
    },
  });

interface RoleFormProps {
  lockCategory?: boolean;
}

// Extracted so it can call useFormShell() — hooks can't be used inside a FieldShell render callback.
// This gives the onBlur handler access to the form to auto-fill short_name.
const RoleNameField = () => {
  const { form } = useFormShell();

  return (
    <FieldShell name="name" label="Name">
      {(field) => (
        <Input
          placeholder="e.g. Coordinator"
          value={field.state.value ?? ""}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={(e) => {
            field.handleBlur();
            const name = e.target.value;
            const shortName = form.getFieldValue("short_name");
            if (name && !shortName) {
              form.setFieldValue("short_name", autoShortName(name));
            }
          }}
        />
      )}
    </FieldShell>
  );
};

const RoleForm = ({ lockCategory }: RoleFormProps) => {
  return (
    <DialogBody>
      <FieldGroup>
        <RoleNameField />

        <FieldShell name="short_name" label="Short name">
          {(field) => (
            <Input
              placeholder="e.g. CO"
              maxLength={10}
              value={field.state.value ?? ""}
              onChange={(e) =>
                field.handleChange(e.target.value.toUpperCase())
              }
              onBlur={field.handleBlur}
            />
          )}
        </FieldShell>

        <SelectField
          name="category"
          label="Category"
          options={CATEGORY_OPTIONS}
          disabled={lockCategory}
        />

        <TextareaField
          name="description"
          label="Description"
          optional
          rows={3}
          placeholder={"What this role covers on the day…\n**Bold text**, *italic*, - lists"}
          description="Supports markdown — **bold**, *italic*, - lists, 1. numbered"
        />
      </FieldGroup>
    </DialogBody>
  );
};

export default RoleForm;
