import { useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import AssigneeField from "@/pages/admin/components/AssigneeField";
import { useMembersQuery } from "@/pages/admin/members/queries";

import { FieldGroup } from "@/components/ui/field";
import { DialogBody } from "@/components/ui/dialog";
import {
  FieldShell,
  TextField,
  TextareaField,
  SelectField,
  TimeField,
  LabelComboboxField,
  type SelectFieldOption,
  type LabelGroup,
} from "@/components/custom/form";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { timelineItemFormSchema, type TimelineItemFormValues } from "../types";
import { generateEventDays } from "../utils";
import { useTimelineQuery } from "../queries";

interface UseTimelineItemFormOpts {
  defaultValues?: Partial<TimelineItemFormValues>;
  onSubmit: (values: TimelineItemFormValues) => void;
}

export const useTimelineItemForm = ({
  defaultValues,
  onSubmit,
}: UseTimelineItemFormOpts) =>
  useForm({
    defaultValues: {
      day: defaultValues?.day ?? "",
      label: defaultValues?.label ?? "",
      time_start: defaultValues?.time_start ?? "",
      time_end: defaultValues?.time_end ?? "",
      title: defaultValues?.title ?? "",
      details: defaultValues?.details ?? "",
      assignees: defaultValues?.assignees ?? [],
    },
    validators: {
      onSubmit: timelineItemFormSchema,
      onChange: timelineItemFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(timelineItemFormSchema.parse(value));
    },
  });

const TimelineItemForm = () => {
  const { dateStart, dateEnd } = useAdminStore();
  const { data: members = [] } = useMembersQuery();
  const { data: timelineData } = useTimelineQuery();
  const labelDays = timelineData?.days ?? [];
  const labelOptions = timelineData?.labels ?? [];

  const memberItems = members
    .filter((m) => !m.frozen_at && !m.rejected_at)
    .map((m) => ({ id: m.id, label: m.display_name }));

  const eventDays = useMemo(() => {
    if (!dateStart || !dateEnd) return [];
    return generateEventDays(dateStart, dateEnd);
  }, [dateStart, dateEnd]);

  const dayOptions: SelectFieldOption[] = eventDays.map((d) => ({
    value: format(d, "yyyy-MM-dd"),
    label: format(d, "d MMM yyyy (EEE)"),
    icon: <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />,
  }));

  // Existing labels grouped per day, for the label picker.
  const labelGroups: LabelGroup[] = labelDays
    .map((day, idx) => ({
      label: `Day ${idx + 1}`,
      items: day.labelGroups
        .filter((g) => g.label !== null)
        .map((g) => g.label as string),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <DialogBody>
      <FieldGroup>
        <TextField
          name="title"
          label="Title"
          placeholder="e.g. Bridal prep"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            name="day"
            label="Day"
            options={dayOptions}
            placeholder="Select a day"
            placeholderIcon={<CalendarIcon className="size-4 shrink-0" />}
          />

          <LabelComboboxField
            name="label"
            label="Label"
            optional
            groups={labelGroups}
            matchAgainst={labelOptions}
            placeholder="e.g. Nikah, Sanding"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TimeField name="time_start" label="Start time" />
          <TimeField name="time_end" label="End time" optional />
        </div>

        <TextareaField
          name="details"
          label="Notes"
          optional
          rows={3}
          placeholder={"- Item one\n- Item two\n**Bold text**, *italic*"}
          hint="Supports markdown — **bold**, *italic*, - lists, 1. numbered"
        />

        <FieldShell
          name="assignees"
          label="Assignees"
          optional
          description="Which team members are responsible for this item?"
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
  );
};

export default TimelineItemForm;
