import { useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { groupMembersByRole } from "@/pages/admin/utils/memberUtils";

import { FieldGroup } from "@/components/ui/field";
import {
  TextField,
  TextareaField,
  SelectField,
  TimeField,
  SelectComboField,
  AssigneeField,
  FormBody,
  useFormShell,
  type SelectFieldOption,
  type SelectComboGroup,
} from "@/components/custom/form";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { timelineItemFormSchema, type TimelineItemFormValues } from "../types";
import { generateEventDays } from "../utils";
import { parseLocalDate } from "@/lib/utils/utils-time";
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

const DURATION_PRESETS = [30, 60, 120] as const;

// Adds minutes to an "HH:mm" time, clamped to 23:59 (no crossing midnight).
const addMinutesToTime = (time: string, mins: number): string => {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const total = Math.min(h * 60 + m + mins, 23 * 60 + 59);
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const TimelineItemForm = () => {
  const { form } = useFormShell();
  const { dateStart, dateEnd } = useAdminStore();

  const setEndFromDuration = (mins: number) => {
    const start = form.getFieldValue("time_start") as string | undefined;
    if (!start) return;
    form.setFieldValue("time_end", addMinutesToTime(start, mins));
  };
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

  const eventDayStrings = eventDays.map((d) => format(d, "yyyy-MM-dd"));

  const dayOptions: SelectFieldOption[] = eventDays.map((d) => ({
    value: format(d, "yyyy-MM-dd"),
    label: format(d, "d MMM yyyy (EEE)"),
    icon: <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />,
  }));

  // Existing labels grouped per day, for the label picker. Number each group by
  // its real position in the event range — not its index among days-with-items,
  // which would mislabel (e.g. Day 2 showing as "Day 1" when Day 1 is empty).
  const labelGroups: SelectComboGroup[] = labelDays
    .map((day) => {
      const dayNum = eventDayStrings.indexOf(day.day) + 1;
      return {
        // dayNum is 0 only when this item's day sits outside the current event
        // range — which happens if the event dates were shortened after the
        // item was scheduled. Keep such orphans visible with a date label
        // rather than dropping them or showing a bogus "Day 0".
        label: dayNum > 0 ? `Day ${dayNum}` : format(parseLocalDate(day.day), "d MMM"),
        items: day.labelGroups
          .filter((g) => g.label !== null)
          .map((g) => g.label as string),
      };
    })
    .filter((g) => g.items.length > 0);

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

          <SelectComboField
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
          <TimeField
            name="time_end"
            label="End time"
            optional
            clearable
            hint={
              <span className="flex flex-wrap items-center gap-1">
                {DURATION_PRESETS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setEndFromDuration(mins)}
                    className="rounded-md border border-border px-1.5 py-0.5 text-2xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                  </button>
                ))}
              </span>
            }
          />
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
