import { useRef, type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { DateField, TextField, TimeField } from "@/components/custom/form";
import { FormShellContext } from "@/components/custom/form/form-context";
import type { DetailsDraft } from "../../types";

const schema = z.object({
  event_date: z
    .string()
    .max(100, "Please keep this under 100 characters")
    .transform((v) => v.trim() || null),
  event_time_start: z
    .string()
    .max(100, "Please keep this under 100 characters")
    .transform((v) => v.trim() || null),
  event_time_end: z
    .string()
    .max(100, "Please keep this under 100 characters")
    .transform((v) => v.trim() || null),
});

interface MainEventCardProps {
  draft: DetailsDraft;
  onUpdate: (patch: Partial<DetailsDraft>) => void;
}

const MainEventCard: FC<MainEventCardProps> = ({ draft, onUpdate }) => {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const form = useForm({
    defaultValues: {
      event_date: draft.event_date ?? "",
      event_time_start: draft.event_time_start ?? "",
      event_time_end: draft.event_time_end ?? "",
    },
    validators: { onChange: schema },
    listeners: {
      onChangeDebounceMs: 150,
      onChange: ({ formApi }) => {
        const parsed = schema.safeParse(formApi.state.values);
        if (!parsed.success) return;
        onUpdateRef.current(parsed.data);
      },
    },
  });
  return (
    <FormShellContext.Provider value={{ attemptCount: 1, form }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Event</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <DateField
              name="event_date"
              label="Date"
              placeholder="e.g. 1 June 2025"
            />
            <TimeField
              name="event_time_start"
              label="Start Time"
              placeholder="11:00 AM"
            />
            <TimeField
              name="event_time_end"
              label="End Time"
              placeholder="5:00 PM"
            />
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default MainEventCard;
