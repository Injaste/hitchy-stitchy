import { type FC, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldTitle } from "@/components/ui/field";
import { SwitchField } from "@/components/custom/fields";
import { FormShellContext } from "@/components/custom/fields/form-context";
import type { RSVPDraft } from "../../types";

const schema = z.object({
  message_visible: z.boolean(),
  message_required: z.boolean(),
});

interface RSVPFormFieldsCardProps {
  draft: RSVPDraft;
  onUpdate: (patch: Partial<RSVPDraft>) => void;
}

const RSVPFormFieldsCard: FC<RSVPFormFieldsCardProps> = ({
  draft,
  onUpdate,
}) => {
  const msg = draft.config.fields.message;

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const form = useForm({
    defaultValues: {
      message_visible: msg.visible,
      message_required: msg.required,
    },
    validators: { onChange: schema },
    listeners: {
      onChange: ({ formApi }) => {
        const parsed = schema.safeParse(formApi.state.values);
        if (!parsed.success) return;

        const { message_visible, message_required } = parsed.data;
        onUpdateRef.current({
          config: {
            ...draft.config,
            fields: {
              message: {
                visible: message_visible,
                required: message_visible ? message_required : false,
              },
            },
          },
        });
      },
    },
  });

  const isVisible = form.getFieldValue("message_visible");

  return (
    <FormShellContext.Provider value={{ attemptCount: 1, form }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Form Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="block space-y-4">
            <Field orientation="horizontal">
              <FieldTitle>Message</FieldTitle>
              <div className="flex gap-4">
                <SwitchField name="message_visible" label="Show" />
                <SwitchField
                  name="message_required"
                  label="Required"
                  disabled={!isVisible}
                />
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </FormShellContext.Provider>
  );
};

export default RSVPFormFieldsCard;
