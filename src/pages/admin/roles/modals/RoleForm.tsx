import type { FC } from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  FormShell,
  TextField,
  TextareaField,
  SelectField,
  type SelectFieldOption,
} from "@/components/custom/fields";

import { roleFormSchema, CATEGORY_LABELS, type RoleFormValues } from "../types";

interface RoleFormProps {
  defaultValues?: Partial<RoleFormValues>;
  onSubmit: (values: RoleFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

const SELECTABLE_CATEGORIES = Object.keys(
  CATEGORY_LABELS,
) as (keyof typeof CATEGORY_LABELS)[];

const CATEGORY_OPTIONS: SelectFieldOption[] = SELECTABLE_CATEGORIES.map((c) => ({
  value: c,
  label: CATEGORY_LABELS[c],
  disabled: c === "root",
}));

const RoleForm: FC<RoleFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}) => {
  const form = useForm({
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

  const lockCategory = defaultValues?.category === "root";

  return (
    <FormShell form={form} className="grid gap-4">
      <DialogBody className="space-y-6">
        <FieldGroup className="block space-y-4">
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
            placeholder="What this role covers on the day…"
          />
        </FieldGroup>
      </DialogBody>

      <Separator />

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </DialogFooter>
    </FormShell>
  );
};

export default RoleForm;
