import { useRef, type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { SelectField, DateField, TimeField } from "@/components/custom/fields";
import { FormShellContext } from "@/components/custom/fields/form-context";
import { RSVP_MODES, type RSVPDraft, type RSVPMode } from "../../types";
import { TIME_REGEX } from "@/pages/admin/types";

const RSVP_MODE_OPTIONS: { value: RSVPMode; label: string }[] = [
  { value: "public", label: "Public — anyone can RSVP" },
  { value: "private", label: "Private — pool only" },
  { value: "both", label: "Both" },
];

const schema = z.object({
  rsvp_mode: z.enum(RSVP_MODES),
  rsvp_deadline_date: z.string().transform((v) => v.trim() || null),
  rsvp_deadline_time: z
    .string()
    .refine(
      (val) => val === "" || TIME_REGEX.test(val),
      "Please enter a valid time",
    )
    .transform((val) => val.trim() || null),
});

interface RSVPSettingsCardProps {
  draft: RSVPDraft;
  onUpdate: (patch: Partial<RSVPDraft>) => void;
}

const RSVPSettingsCard: FC<RSVPSettingsCardProps> = ({ draft, onUpdate }) => {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const [initDate, initTime = ""] = (draft.rsvp_deadline ?? "").split(" ");

  const form = useForm({
    defaultValues: {
      rsvp_mode: draft.rsvp_mode,
      rsvp_deadline_date: (initDate ?? null) as string | null,
      rsvp_deadline_time: initTime || "23:59",
    },
    validators: { onChange: schema },
    listeners: {
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
              <DateField name="rsvp_deadline_date" label="Deadline date" />
              <TimeField name="rsvp_deadline_time" label="Deadline time" />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default RSVPSettingsCard;
