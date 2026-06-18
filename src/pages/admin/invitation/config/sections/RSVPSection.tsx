import { useEffect } from "react";
import { useStore } from "@tanstack/react-form";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { SelectField, DateField, TimeField, TextField } from "@/components/custom/form";
import { useFormShell } from "@/components/custom/form/form-context";
import { type RSVPMode } from "../../types";

const RSVP_MODE_OPTIONS: { value: RSVPMode; label: string }[] = [
  { value: "public", label: "Public — anyone can RSVP" },
  { value: "private", label: "Private — invited guests only" },
  { value: "both", label: "Both — public, plus reserved seats" },
];

// A short, human-typeable shared code (no ambiguous 0/O/1/I) the couple broadcasts
// to private guests. They unlock by entering their phone + this code.
const generateCode = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

// The shared gate code — only relevant when RSVP is gated (private/both). Reads the
// mode live so it shows/hides without a remount.
const PrivateCodeFields = () => {
  const { form } = useFormShell();
  const mode: RSVPMode = useStore(
    form.store,
    (s: any) => s.values.rsvp_mode ?? "public",
  );
  if (mode === "public") return null;

  const fill = () => {
    form.setFieldValue("private_code", generateCode());
    form.setFieldMeta("private_code", (m: any) => ({
      ...m,
      isDirty: true,
      isTouched: true,
    }));
  };

  const label = (
    <span className="flex w-full items-center justify-between gap-2">
      Private code
      <button
        type="button"
        onClick={fill}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline cursor-pointer"
      >
        <Sparkles className="size-3" />
        Generate
      </button>
    </span>
  );

  return (
    <TextField
      name="private_code"
      label={label}
      placeholder="e.g. ROSE26"
      hint="Enter your own or generate one — share this code with all invited guests so they can RSVP with their phone."
    />
  );
};

const DeadlineFields = () => {
  const { form } = useFormShell();
  const dateValue: string = useStore(
    form.store,
    (s: any) => s.values.rsvp_deadline_date ?? "",
  );

  useEffect(() => {
    const currentTime: string = form.getFieldValue("rsvp_deadline_time") ?? "";
    if (dateValue) {
      if (!currentTime) form.setFieldValue("rsvp_deadline_time", "23:59");
    } else if (currentTime) {
      form.setFieldValue("rsvp_deadline_time", "");
    }
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
        <PrivateCodeFields />
        <DeadlineFields />
      </FieldGroup>
    </CardContent>
  </Card>
);

export default RSVPSection;
