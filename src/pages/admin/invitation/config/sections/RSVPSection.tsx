import { useEffect } from "react";
import { useStore } from "@tanstack/react-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { SelectField, DateField, TimeField } from "@/components/custom/form";
import { useFormShell } from "@/components/custom/form/form-context";
import { type RSVPMode } from "../../types";

const RSVP_MODE_OPTIONS: { value: RSVPMode; label: string }[] = [
  { value: "public", label: "Public — anyone can RSVP" },
  { value: "private", label: "Private — selected guests only" },
  { value: "both", label: "Both" },
];

const DeadlineFields = () => {
  const { form } = useFormShell();
  const dateValue: string = useStore(
    form.store,
    (s: any) => s.values.rsvp_deadline_date ?? "",
  );

  useEffect(() => {
    if (!dateValue) return;
    const currentTime: string = form.getFieldValue("rsvp_deadline_time") ?? "";
    if (!currentTime) form.setFieldValue("rsvp_deadline_time", "23:59");
  }, [dateValue, form]);

  const hasDate = !!dateValue;

  return (
    <div className="grid grid-cols-2 gap-3">
      <DateField name="rsvp_deadline_date" label="Deadline date" optional />
      <TimeField
        name="rsvp_deadline_time"
        label="Deadline time"
        optional={!hasDate}
      />
    </div>
  );
};

const RSVPSection = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm tracking-wide uppercase text-muted-foreground">
        RSVP
      </CardTitle>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <SelectField
          name="rsvp_mode"
          label="RSVP mode"
          options={RSVP_MODE_OPTIONS}
        />
        <DeadlineFields />
      </FieldGroup>
    </CardContent>
  </Card>
);

export default RSVPSection;
