import type { AnyFieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { cn } from "@/lib/utils";
import { useFormShell } from "../form-context";

export interface FieldShellProps {
  name: string;
  label?: ReactNode;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  fieldClassName?: string;
  children: (field: AnyFieldApi, hasError: boolean) => ReactNode;
}

const FieldShell = ({
  name,
  label,
  optional,
  description,
  hint,
  fieldClassName,
  children,
}: FieldShellProps) => {
  const { attemptCount, form } = useFormShell();
  const FormField = form.Field;

  return (
    <FormField name={name}>
      {(field: AnyFieldApi) => {
        const hasError = !!field.state.meta.errors.length && attemptCount > 0;
        return (
          <AnimateItem
            errors={field.state.meta.errors}
            hasError={hasError}
            attemptCount={attemptCount}
          >
            <Field
              data-invalid={hasError}
              className={cn("gap-2", fieldClassName)}
            >
              {label && (
                <FieldLabel>
                  {label}
                  {optional && (
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      (optional)
                    </span>
                  )}
                </FieldLabel>
              )}
              {hint && (
                <p className="text-xs text-muted-foreground -mt-1">{hint}</p>
              )}
              <FieldContent>{children(field, hasError)}</FieldContent>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </Field>
          </AnimateItem>
        );
      }}
    </FormField>
  );
};

export default FieldShell;
