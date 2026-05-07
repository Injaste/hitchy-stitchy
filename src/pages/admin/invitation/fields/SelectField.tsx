import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import type { FieldOption } from "@/pages/templates/themes/types";

interface SelectFieldProps {
  field: AnyFieldApi;
  label: string;
  options: FieldOption[];
  attemptCount: number;
  placeholder?: string;
}

const SelectField = ({
  field,
  label,
  options,
  attemptCount,
  placeholder,
}: SelectFieldProps) => {
  const hasError = !!field.state.meta.errors.length && attemptCount > 0;

  return (
    <AnimateItem
      errors={field.state.meta.errors}
      hasError={hasError}
      attemptCount={attemptCount}
    >
      <Field data-invalid={hasError} className="gap-2">
        <FieldLabel>{label}</FieldLabel>
        <FieldContent>
          <Select
            value={field.state.value ?? ""}
            onValueChange={(v) => field.handleChange(v)}
          >
            <SelectTrigger className="w-full">
              {field.state.value ? (
                <SelectValue />
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </SelectTrigger>
            <SelectContent position="popper">
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>
    </AnimateItem>
  );
};

export default SelectField;
