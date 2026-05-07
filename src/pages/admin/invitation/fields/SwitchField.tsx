import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

interface SwitchFieldProps {
  field: AnyFieldApi;
  label: string;
}

const SwitchField = ({ field, label }: SwitchFieldProps) => (
  <Field orientation="horizontal">
    <FieldLabel>{label}</FieldLabel>
    <Switch
      checked={!!field.state.value}
      onCheckedChange={(v) => field.handleChange(v)}
    />
  </Field>
);

export default SwitchField;
