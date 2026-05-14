import type { FC } from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  FormShell,
  FieldShell,
  TextField,
  TextareaField,
  SelectField,
  DateField,
  type SelectFieldOption,
} from "@/components/custom/form";
import AssigneeField from "@/pages/admin/components/AssigneeField";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { isActiveMember } from "@/pages/admin/utils/memberUtils";

import { taskFormSchema, type TaskFormValues } from "../types";
import { useTasksQuery } from "../queries";
import LabelCombobox from "../components/LabelCombobox";

const PRIORITY_OPTIONS: SelectFieldOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

const TaskForm: FC<TaskFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}) => {
  const { data: members = [] } = useMembersQuery();
  const { data: tasks = [] } = useTasksQuery();

  const memberItems = members
    .filter(isActiveMember)
    .map((m) => ({ id: m.id, label: m.display_name }));

  const labelOptions = Array.from(
    new Set(
      tasks
        .map((t) => t.label)
        .filter((l): l is string => !!l && l.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const form = useForm({
    defaultValues: {
      title: defaultValues?.title ?? "",
      details: defaultValues?.details ?? "",
      label: defaultValues?.label ?? "",
      priority: defaultValues?.priority ?? null,
      due_at: defaultValues?.due_at ?? null,
      assignees: defaultValues?.assignees ?? [],
    },
    validators: {
      onSubmit: taskFormSchema,
      onChange: taskFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(taskFormSchema.parse(value));
    },
  });

  return (
    <FormShell form={form} className="grid gap-4">
      <DialogBody>
        <FieldGroup>
          <TextField
            name="title"
            label="Title"
            placeholder="e.g. Confirm florist delivery time"
          />

          <FieldShell name="label" label="Label" optional>
            {(field) => (
              <LabelCombobox
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                labels={labelOptions}
                placeholder="e.g. Nikah, Sanding"
              />
            )}
          </FieldShell>

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              name="priority"
              label="Priority"
              optional
              nullable
              options={PRIORITY_OPTIONS}
            />

            <DateField name="due_at" label="Due date" optional />
          </div>

          <TextareaField
            name="details"
            label="Additional Items"
            optional
            rows={3}
            placeholder={"- Item one\n- Item two\n**Bold text**, *italic*"}
            description="Supports markdown — **bold**, *italic*, - lists, 1. numbered"
          />

          <FieldShell
            name="assignees"
            label="Assigned members"
            optional
            hint="Which team members are accountable for this task?"
          >
            {(field) => (
              <AssigneeField
                value={field.state.value}
                onChange={field.handleChange}
                items={memberItems}
              />
            )}
          </FieldShell>
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

export default TaskForm;
