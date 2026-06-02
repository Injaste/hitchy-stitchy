import { useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { groupMembersByRole } from "@/pages/admin/utils/memberUtils";

import { FieldGroup } from "@/components/ui/field";
import {
  FieldShell,
  TextField,
  TextareaField,
  SelectField,
  TimeField,
  AssigneeField,
  LabelComboboxField,
  FormBody,
  type SelectFieldOption,
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
      time_start: defaultValues?.time_start ?? "09:00",
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

  const assignableMembers = members.filter(
    (m) => !m.frozen_at && !m.rejected_at,
  );
  const memberItems = assignableMembers.map((m) => ({
    id: m.id,
    label: m.display_name,
  }));

  const memberGroups = groupMembersByRole(assignableMembers);

  const eventDays = useMemo(() => {
    if (!dateStart || !dateEnd) return [];
    return generateEventDays(dateStart, dateEnd);
  }, [dateStart, dateEnd]);

  const dayOptions: SelectFieldOption[] = eventDays.map((d) => ({
    value: format(d, "yyyy-MM-dd"),
    label: format(d, "d MMM yyyy (EEE)"),
    icon: <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />,
  }));

  return (
    <FormBody>
      <FieldGroup>
        <TextField name="title" label="Title" placeholder="e.g. Bridal prep" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            name="day"
            label="Day"
            options={dayOptions}
            placeholder="Select a day"
            placeholderIcon={<CalendarIcon className="size-4 shrink-0" />}
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
          description="Supports markdown — **bold**, *italic*, - lists, 1. numbered"
        />

        <AssigneeField
          name="assignees"
          label="Assignees"
          optional
          description="Which team members are responsible for this item?"
          items={memberItems}
          groups={memberGroups}
        />
      </FieldGroup>
    </FormBody>
  );
};

export default TimelineItemForm;
