import type { AnyFieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useFormShell } from "./form-context";

interface SwitchFieldProps {
  name: string;
  label: ReactNode;
}

const SwitchField = ({ name, label }: SwitchFieldProps) => {
  const { form } = useFormShell();
  const FormField = form.Field;

  return (
    <FormField name={name}>
      {(field: AnyFieldApi) => (
        <Field orientation="horizontal">
          <FieldLabel>{label}</FieldLabel>
          <Switch
            checked={!!field.state.value}
            onCheckedChange={(v) => field.handleChange(v)}
          />
        </Field>
      )}
    </FormField>
  );
};

export default SwitchField;
