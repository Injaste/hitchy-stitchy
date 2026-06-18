import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/custom/form";

const GuestLimitsSection = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm tracking-wide uppercase text-muted-foreground">
        Guest Limits
      </CardTitle>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <TextField
          name="max_guests"
          label="Total guests"
          placeholder="No limit"
          type="number"
          optional
          min={1}
          max={10000}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            name="guest_count_min"
            label="Min party size"
            type="number"
            min={1}
            max={99}
          />
          <TextField
            name="guest_count_max"
            label="Max party size"
            type="number"
            min={1}
            max={99}
          />
        </div>
      </FieldGroup>
    </CardContent>
  </Card>
);

export default GuestLimitsSection;
