import { useEffect, useRef, type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  SelectField,
  DateField,
  TimeField,
  type SelectFieldOption,
} from "@/components/custom/fields";
import { FormShellContext } from "@/components/custom/fields/form-context";
import type { RSVPDraft, RSVPMode } from "../../types";

const RSVP_MODE_OPTIONS: SelectFieldOption[] = [
  { value: "public", label: "Public — anyone can RSVP" },
  { value: "private", label: "Private — pool only" },
  { value: "both", label: "Both" },
];

const schema = z.object({
  rsvp_mode: z.enum(["public", "private", "both"]),
  rsvp_deadline_date: z.string().nullable(),
  rsvp_deadline_time: z.string().max(20, "Please keep this under 20 characters"),
});

const combine = (date: string | null, time: string): string | null =>
  date ? (time ? `${date} ${time}` : date) : null;

interface RSVPSettingsCardProps {
  draft: RSVPDraft;
  onUpdate: (patch: Partial<RSVPDraft>) => void;
}

const RSVPSettingsCard: FC<RSVPSettingsCardProps> = ({ draft, onUpdate }) => {
  const [initDate, initTime = ""] = (draft.rsvp_deadline ?? "").split(" ");

  const form = useForm({
    defaultValues: {
      rsvp_mode: draft.rsvp_mode,
      rsvp_deadline_date: initDate ?? null,
      rsvp_deadline_time: initTime || "23:59",
    },
    validators: { onChange: schema },
  });

  const mode = form.useStore((s) => s.values.rsvp_mode);
  const date = form.useStore((s) => s.values.rsvp_deadline_date);
  const time = form.useStore((s) => s.values.rsvp_deadline_time);

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    onUpdateRef.current({
      rsvp_mode: mode as RSVPMode,
      rsvp_deadline: combine(date, time),
    });
  }, [mode, date, time]);

  return (
    <FormShellContext.Provider value={{ attemptCount: 1, form }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="block space-y-4">
            <SelectField
              name="rsvp_mode"
              label="RSVP Mode"
              options={RSVP_MODE_OPTIONS}
            />
            <div className="grid grid-cols-2 gap-3">
              <DateField
                name="rsvp_deadline_date"
                label="Deadline Date"
                optional
              />
              <TimeField
                name="rsvp_deadline_time"
                label="Deadline Time"
                optional
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default RSVPSettingsCard;
