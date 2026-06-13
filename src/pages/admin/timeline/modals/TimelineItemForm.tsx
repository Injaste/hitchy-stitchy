import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { getMemberAssigneeOptions } from "@/pages/admin/utils/memberUtils";

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

import { timelineItemFormSchema, type TimelineItemFormValues } from "../types";
import { useTimelineQuery } from "../queries";
import { findSegment } from "../utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      segment_id: defaultValues?.segment_id ?? "",
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

  // Which preset just got clamped to 23:59, so we can flash a tooltip on it.
  const [cappedPreset, setCappedPreset] = useState<number | null>(null);
  const capTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(capTimer.current), []);

  const setEndFromDuration = (mins: number) => {
    const start = form.getFieldValue("time_start") as string | undefined;
    if (!start) return;
    form.setFieldValue("time_end", addMinutesToTime(start, mins));

    // addMinutesToTime clamps to 23:59 because a schedule item lives on a single
    // day — we don't model items spilling past midnight into the next day. When a
    // preset would have crossed midnight the end silently lands on 23:59, which
    // looks like the +Xm did the wrong math; flash a tooltip to explain it.
    const [h, m] = start.split(":").map(Number);
    const crossedMidnight = h * 60 + m + mins > 23 * 60 + 59;
    clearTimeout(capTimer.current);
    if (crossedMidnight) {
      setCappedPreset(mins);
      capTimer.current = setTimeout(() => setCappedPreset(null), 2500);
    } else {
      setCappedPreset(null);
    }
  };
  const { data: members = [] } = useMembersQuery();
  const { data: timelineData } = useTimelineQuery();
  const days = timelineData?.days ?? [];
  const allLabels = timelineData?.labels ?? [];

  // The segment this item lives in. Tracked live (not just at open) so changing
  // the Segment field re-resolves which labels count as "in this segment".
  const selectedSegmentId = useStore(
    form.store,
    (s: unknown) => (s as { values: TimelineItemFormValues }).values.segment_id,
  );

  const { items: memberItems, groups: memberGroups } =
    getMemberAssigneeOptions(members);

  // Every segment across the event, labelled "Day N · <segment>".
  const segmentOptions: SelectFieldOption[] = useMemo(
    () =>
      days.flatMap((d, i) =>
        d.segments.map((s) => ({
          value: s.id,
          label: s.name || d.label,
          icon: (
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          ),
        })),
      ),
    [days],
  );

  // Label picker framed around the selected segment. "In this segment" are the
  // labels already there — picking one merges the item into that existing group.
  // "Other labels" are every other name, de-duplicated, so reusing a name reads
  // as "reuse the name here", not "this label belongs elsewhere".
  const selectedSegment = findSegment(days, selectedSegmentId);
  const inThisSegment =
    selectedSegment?.labelGroups
      .filter((g) => g.label !== null)
      .map((g) => g.label as string) ?? [];
  const inSegmentSet = new Set(inThisSegment);
  const otherLabels = allLabels.filter((l) => !inSegmentSet.has(l));

  const labelGroups: SelectComboGroup[] = [
    ...(inThisSegment.length
      ? [{ label: "In this segment", items: inThisSegment }]
      : []),
    ...(otherLabels.length
      ? [{ label: "Other labels", items: otherLabels }]
      : []),
  ];

  return (
    <FormBody>
      <FieldGroup>
        <TextField name="title" label="Title" placeholder="e.g. Bridal prep" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            name="segment_id"
            label="Segment"
            options={segmentOptions}
            placeholder="Select a segment"
            placeholderIcon={<CalendarIcon className="size-4 shrink-0" />}
          />

          <SelectComboField
            name="label"
            label="Label"
            optional
            groups={labelGroups}
            matchAgainst={allLabels}
            placeholder="e.g. Vows, Toast"
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
                  <Tooltip key={mins} open={cappedPreset === mins}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setEndFromDuration(mins)}
                        className="rounded-md border border-border px-1.5 py-0.5 text-2xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Capped at 23:59 — items can't cross midnight
                    </TooltipContent>
                  </Tooltip>
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
