import { type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FieldShell } from "@/components/custom/fields";
import { FormShellContext } from "@/components/custom/fields/form-context";
import type { RSVPDraft } from "../../types";

const schema = z.object({
  max_guests: z.union([
    z.literal(""),
    z.coerce.number().min(0, "Please enter 0 or more"),
  ]),
  guest_count_min: z.coerce.number().min(0, "Please enter 0 or more"),
  guest_count_max: z.coerce.number().min(0, "Please enter 0 or more"),
  confirmation_message: z
    .string()
    .max(100, "Please keep this under 100 characters"),
});

interface RSVPGuestLimitsCardProps {
  draft: RSVPDraft;
  onUpdate: (patch: Partial<RSVPDraft>) => void;
}

const RSVPGuestLimitsCard: FC<RSVPGuestLimitsCardProps> = ({
  draft,
  onUpdate,
}) => {
  const form = useForm({
    defaultValues: {
      max_guests: draft.max_guests?.toString() ?? "",
      guest_count_min: draft.guest_count_min.toString(),
      guest_count_max: draft.guest_count_max.toString(),
      confirmation_message: draft.confirmation_message,
    },
    validators: { onChange: schema },
  });

  return (
    <FormShellContext.Provider value={{ attemptCount: 1, form }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Guest Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="block space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FieldShell name="max_guests" label="Max Guests" optional>
                {(field) => (
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      onUpdate({
                        max_guests: e.target.value
                          ? Number(e.target.value)
                          : null,
                      });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              </FieldShell>
              <FieldShell name="guest_count_min" label="Min per RSVP">
                {(field) => (
                  <Input
                    type="number"
                    min={0}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      onUpdate({
                        guest_count_min: Number(e.target.value) || 1,
                      });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              </FieldShell>
              <FieldShell name="guest_count_max" label="Max per RSVP">
                {(field) => (
                  <Input
                    type="number"
                    min={0}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      onUpdate({
                        guest_count_max: Number(e.target.value) || 10,
                      });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              </FieldShell>
            </div>
            <FieldShell name="confirmation_message" label="Confirmation Message">
              {(field) => (
                <Input
                  placeholder="We look forward to celebrating with you!"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    onUpdate({ confirmation_message: e.target.value });
                  }}
                  onBlur={field.handleBlur}
                />
              )}
            </FieldShell>
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default RSVPGuestLimitsCard;
