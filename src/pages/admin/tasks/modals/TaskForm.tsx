import { useForm } from "@tanstack/react-form";

import { FieldGroup } from "@/components/ui/field";
import { DialogBody } from "@/components/ui/dialog";
import {
  FieldShell,
  TextField,
  TextareaField,
  SelectField,
  DateField,
  AssigneeField,
  type SelectFieldOption,
} from "@/components/custom/form";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { groupMembersByLabel } from "@/pages/admin/utils/memberUtils";

import { taskFormSchema, type TaskFormValues } from "../types";
import { useTasksQuery } from "../queries";
import LabelCombobox from "../components/LabelCombobox";

const PRIORITY_OPTIONS: SelectFieldOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface UseTaskFormOpts {
  defaultValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => void;
}

export const useTaskForm = ({ defaultValues, onSubmit }: UseTaskFormOpts) =>
  useForm({
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

const TaskForm = () => {
  const { data: members = [] } = useMembersQuery();
  const { data: tasks = [] } = useTasksQuery();

  const assignableMembers = members.filter(
    (m) => !m.frozen_at && !m.rejected_at,
  );
  const memberItems = assignableMembers.map((m) => ({
    id: m.id,
    label: m.display_name,
  }));

  const memberGroups = groupMembersByLabel(assignableMembers);

  const labelOptions = Array.from(
    new Set(
      tasks
        .map((t) => t.label)
        .filter((l): l is string => !!l && l.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return (
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

        <AssigneeField
          name="assignees"
          label="Assigned members"
          optional
          description="Which team members are accountable for this task?"
          items={memberItems}
          groups={memberGroups}
        />
      </FieldGroup>
    </DialogBody>
  );
};

export default TaskForm;
