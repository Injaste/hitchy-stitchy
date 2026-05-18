import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { SelectField, DateField, TimeField } from "@/components/custom/form";
import { type RSVPMode } from "../../types";

const RSVP_MODE_OPTIONS: { value: RSVPMode; label: string }[] = [
  { value: "public", label: "Public — anyone can RSVP" },
  { value: "private", label: "Private — selected guests only" },
  { value: "both", label: "Both" },
];

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
        <div className="grid grid-cols-2 gap-3">
          <DateField name="rsvp_deadline_date" label="Deadline date" optional />
          <TimeField name="rsvp_deadline_time" label="Deadline time" optional />
        </div>
      </FieldGroup>
    </CardContent>
  </Card>
);

export default RSVPSection;
