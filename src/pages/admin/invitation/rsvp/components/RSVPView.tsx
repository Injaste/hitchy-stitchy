import { type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RSVPDraft, RSVPMode } from "../../types";

interface RSVPViewProps {
  draft: RSVPDraft;
  onUpdate: (patch: Partial<RSVPDraft>) => void;
}

const RSVPView: FC<RSVPViewProps> = ({ draft, onUpdate }) => {
  const { rsvp_mode, rsvp_deadline, config } = draft;
  const msg = config.fields.message;

  const setMsgField = (patch: Partial<typeof msg>) =>
    onUpdate({
      config: {
        ...config,
        fields: { message: { ...msg, ...patch } },
      },
    });

  return (
    <div className="space-y-3 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="block space-y-4">
            <Field>
              <FieldLabel>RSVP Mode</FieldLabel>
              <FieldContent>
                <Select
                  value={rsvp_mode}
                  onValueChange={(v) => onUpdate({ rsvp_mode: v as RSVPMode })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="public">
                      Public — anyone can RSVP
                    </SelectItem>
                    <SelectItem value="private">Private — pool only</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>
                RSVP Deadline{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={rsvp_deadline ?? ""}
                  onChange={(e) => onUpdate({ rsvp_deadline: e.target.value })}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

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
                onCheckedChange={(v) => setMsgField({ visible: v })}
              />
            </Field>
            {msg.visible && (
              <Field orientation="horizontal">
                <FieldLabel>Message required</FieldLabel>
                <Switch
                  checked={msg.required}
                  onCheckedChange={(v) => setMsgField({ required: v })}
                />
              </Field>
            )}
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default RSVPView;
