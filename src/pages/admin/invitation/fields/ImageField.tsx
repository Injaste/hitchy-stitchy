import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AnimateItem } from "@/components/animations/forms/field-animate";

interface ImageFieldProps {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  attemptCount: number;
}

const ImageField = ({
  field,
  label,
  placeholder,
  attemptCount,
}: ImageFieldProps) => {
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
          <Input
            placeholder={placeholder ?? "https://... or /image.png"}
            value={field.state.value ?? ""}
            onChange={(e) => field.handleChange(e.target.value || null)}
            onBlur={field.handleBlur}
          />
        </FieldContent>
      </Field>
    </AnimateItem>
  );
};

export default ImageField;
