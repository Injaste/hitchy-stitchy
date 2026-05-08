import { type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { RSVPDraft } from "../../types";

interface RSVPFormFieldsCardProps {
  draft: RSVPDraft;
  onUpdate: (patch: Partial<RSVPDraft>) => void;
}

const RSVPFormFieldsCard: FC<RSVPFormFieldsCardProps> = ({ draft, onUpdate }) => {
  const msg = draft.config.fields.message;

  const setMsg = (patch: Partial<typeof msg>) =>
    onUpdate({
      config: {
        ...draft.config,
        fields: { message: { ...msg, ...patch } },
      },
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Form Fields</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="block space-y-4">
          <Field orientation="horizontal">
            <FieldLabel>Show message field</FieldLabel>
            <Switch
              checked={msg.visible}
              onCheckedChange={(v) => setMsg({ visible: v })}
            />
          </Field>
          {msg.visible && (
            <Field orientation="horizontal">
              <FieldLabel>Message required</FieldLabel>
              <Switch
                checked={msg.required}
                onCheckedChange={(v) => setMsg({ required: v })}
              />
            </Field>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
};

export default RSVPFormFieldsCard;
