import { type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FieldShell } from "@/components/custom/fields";
import { FormShellContext } from "@/components/custom/fields/form-context";
import type { DetailsDraft } from "../../types";

const schema = z.object({
  event_date: z.string().max(100, "Please keep this under 100 characters"),
  event_time_start: z.string().max(100, "Please keep this under 100 characters"),
  event_time_end: z.string().max(100, "Please keep this under 100 characters"),
});

interface MainEventCardProps {
  draft: DetailsDraft;
  onUpdate: (patch: Partial<DetailsDraft>) => void;
}

const MainEventCard: FC<MainEventCardProps> = ({ draft, onUpdate }) => {
  const form = useForm({
    defaultValues: {
      event_date: draft.event_date ?? "",
      event_time_start: draft.event_time_start ?? "",
      event_time_end: draft.event_time_end ?? "",
    },
    validators: { onChange: schema },
  });

  return (
    <FormShellContext.Provider value={{ attemptCount: 1, form }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Event</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="block space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FieldShell name="event_date" label="Date">
                {(field) => (
                  <Input
                    placeholder="e.g. 1 June 2025"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      onUpdate({ event_date: e.target.value || null });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              </FieldShell>
              <FieldShell name="event_time_start" label="Start Time">
                {(field) => (
                  <Input
                    placeholder="11:00 AM"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      onUpdate({ event_time_start: e.target.value || null });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              </FieldShell>
              <FieldShell name="event_time_end" label="End Time">
                {(field) => (
                  <Input
                    placeholder="5:00 PM"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      onUpdate({ event_time_end: e.target.value || null });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              </FieldShell>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default MainEventCard;
