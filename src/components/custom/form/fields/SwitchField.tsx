import type { AnyFieldApi } from "@tanstack/react-form";
import { useId, type ReactNode } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useFormShell } from "../form-context";

interface SwitchFieldProps {
  name: string;
  label: ReactNode;
  disabled?: boolean;
}

const SwitchField = ({ name, label, disabled = false }: SwitchFieldProps) => {
  const { form } = useFormShell();
  const FormField = form.Field;
  // Not a FieldShell consumer, so it wires its own label association: clicking
  // the label toggles the switch, and a screen reader announces it by name.
  const id = useId();

  return (
    <FormField name={name}>
      {(field: AnyFieldApi) => (
        <Field orientation="horizontal">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Switch
            id={id}
            checked={!!field.state.value}
            onCheckedChange={(v) => field.handleChange(v)}
            disabled={disabled}
          />
        </Field>
      )}
    </FormField>
  );
};

export default SwitchField;
