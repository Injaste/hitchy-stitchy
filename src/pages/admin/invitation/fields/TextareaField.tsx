import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { AnimateItem } from "@/components/animations/forms/field-animate";

interface TextareaFieldProps {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  attemptCount: number;
  rows?: number;
}

const TextareaField = ({
  field,
  label,
  placeholder,
  attemptCount,
  rows = 2,
}: TextareaFieldProps) => {
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
          <Textarea
            placeholder={placeholder}
            value={field.state.value ?? ""}
            onChange={(e) => field.handleChange(e.target.value || null)}
            onBlur={field.handleBlur}
            rows={rows}
          />
        </FieldContent>
      </Field>
    </AnimateItem>
  );
};

export default TextareaField;
