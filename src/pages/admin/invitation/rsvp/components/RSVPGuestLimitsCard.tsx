import { useRef, type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { TextareaField, TextField } from "@/components/custom/fields";
import { FormShellContext } from "@/components/custom/fields/form-context";
import type { RSVPDraft } from "../../types";

const schema = z.object({
  max_guests: z.coerce
    .number()
    .min(1, "Please enter 0 or more")
    .max(10000, "Please enter 10,000 or less")
    .nullable(),
  guest_count_min: z.coerce
    .number()
    .min(1, "Please enter 0 or more")
    .max(99, "Please enter 99 or less"),
  guest_count_max: z.coerce
    .number()
    .min(1, "Please enter 0 or more")
    .max(99, "Please enter 99 or less"),
  confirmation_message: z
    .string()
    .max(500, "Please keep this under 500 characters")
    .transform((v) => v.trim() || null),
});
interface RSVPGuestLimitsCardProps {
  draft: RSVPDraft;
  onUpdate: (patch: Partial<RSVPDraft>) => void;
}

const RSVPGuestLimitsCard: FC<RSVPGuestLimitsCardProps> = ({
  draft,
  onUpdate,
}) => {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const form = useForm({
    defaultValues: {
      max_guests: draft.max_guests ?? null,
      guest_count_min: draft.guest_count_min,
      guest_count_max: draft.guest_count_max,
      confirmation_message: draft.confirmation_message ?? null,
    },
    validators: {
      onChange: ({ value }) => {
        const parsed = schema.safeParse(value);

        if (!parsed.success) {
          const properties = z.treeifyError(parsed.error).properties ?? {};

          const fields = Object.fromEntries(
            Object.entries(properties)
              .filter(([, tree]) => tree?.errors?.length)
              .map(([key, tree]) => [key, { message: tree!.errors[0] }]),
          );

          return { fields };
        }
      },
    },
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
          <CardTitle className="text-sm">Guest Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid grid-cols-3 gap-3">
              <TextField
                name="max_guests"
                label="Max Guests"
                placeholder="No limit"
                type="number"
                optional
                min={1}
                max={10000}
              />
              <TextField
                name="guest_count_min"
                label="Min per RSVP"
                type="number"
                min={1}
                max={99}
              />
              <TextField
                name="guest_count_max"
                label="Max per RSVP"
                type="number"
                min={1}
                max={99}
              />
            </div>
            <TextareaField
              name="confirmation_message"
              label="Confirmation Message"
              placeholder="We look forward to celebrating with you!"
            />
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default RSVPGuestLimitsCard;
