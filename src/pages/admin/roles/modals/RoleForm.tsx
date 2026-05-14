import { useForm } from "@tanstack/react-form";

import { FieldGroup } from "@/components/ui/field";
import { DialogBody } from "@/components/ui/dialog";
import {
  TextField,
  TextareaField,
  SelectField,
  type SelectFieldOption,
} from "@/components/custom/form";

import { roleFormSchema, CATEGORY_LABELS, type RoleFormValues } from "../types";

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

const RoleForm = ({ lockCategory }: RoleFormProps) => {
  return (
    <DialogBody>
      <FieldGroup>
        <TextField name="name" label="Name" placeholder="e.g. Coordinator" />

        <TextField
          name="short_name"
          label="Short name"
          placeholder="e.g. CO"
          maxLength={10}
          transform={(v) => v.toUpperCase()}
        />

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
