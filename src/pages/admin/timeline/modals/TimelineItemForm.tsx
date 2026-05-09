import { useMemo, type FC } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import AssigneeField from "@/pages/admin/components/AssigneeField";
import { useRolesQuery } from "@/pages/admin/roles/queries";

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
  TimeField,
  type SelectFieldOption,
} from "@/components/custom/fields";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { timelineItemFormSchema, type TimelineItemFormValues } from "../types";
import { generateEventDays } from "../utils";
import { useTimelineQuery } from "../queries";
import LabelCombobox from "../components/LabelCombobox";

interface TimelineItemFormProps {
  defaultValues?: Partial<TimelineItemFormValues>;
  onSubmit: (values: TimelineItemFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

const TimelineItemForm: FC<TimelineItemFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}) => {
  const { dateStart, dateEnd } = useAdminStore();
  const { data: roles = [] } = useRolesQuery();
  const { data: timelineData } = useTimelineQuery();
  const labelDays = timelineData?.days ?? [];
  const labelOptions = timelineData?.labels ?? [];

  const roleItems = roles.map((r) => ({ id: r.id, label: r.name }));

  const eventDays = useMemo(() => {
    if (!dateStart || !dateEnd) return [];
    return generateEventDays(dateStart, dateEnd);
  }, [dateStart, dateEnd]);

  const dayOptions: SelectFieldOption[] = eventDays.map((d) => ({
    value: format(d, "yyyy-MM-dd"),
    label: format(d, "d MMM yyyy (EEE)"),
    icon: <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />,
  }));

  const form = useForm({
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

  return (
    <FormShell form={form} className="grid gap-4">
      <DialogBody>
        <FieldGroup>
          <TextField
            name="title"
            label="Title"
            placeholder="e.g. Bridal prep"
          />

          <FieldShell name="label" label="Label" optional>
            {(field) => (
              <LabelCombobox
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                days={labelDays}
                labels={labelOptions}
                placeholder="e.g. Nikah, Sanding"
              />
            )}
          </FieldShell>

          <SelectField
            name="day"
            label="Day"
            options={dayOptions}
            placeholder="Select a day"
            placeholderIcon={<CalendarIcon className="size-4 shrink-0" />}
          />

          <div className="grid grid-cols-2 gap-3">
            <TimeField name="time_start" label="Start time" />
            <TimeField name="time_end" label="End time" optional />
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
            label="Assigned roles"
            optional
            hint="Which roles are responsible for this item?"
          >
            {(field) => (
              <AssigneeField
                value={field.state.value}
                onChange={field.handleChange}
                items={roleItems}
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

export default TimelineItemForm;
