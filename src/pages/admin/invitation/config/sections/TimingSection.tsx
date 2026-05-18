import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { DateField, TimeField } from "@/components/custom/form";

const TimingSection = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm tracking-wide uppercase text-muted-foreground">
        Event Timing
      </CardTitle>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <DateField name="event_date" label="Event date" />
        <div className="grid grid-cols-2 gap-3">
          <TimeField name="event_time_start" label="Start time" />
          <TimeField name="event_time_end" label="End time" />
        </div>
      </FieldGroup>
    </CardContent>
  </Card>
);

export default TimingSection;
