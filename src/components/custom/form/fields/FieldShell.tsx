import type { AnyFieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
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
  labelClassName?: string;
  children: (field: AnyFieldApi, hasError: boolean) => ReactNode;
}

const FieldShell = ({
  name,
  label,
  optional,
  description,
  hint,
  fieldClassName,
  labelClassName,
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
                <FieldLabel className={labelClassName}>
                  {label}
                  {optional && (
                    <Badge variant="outline" className="h-4 px-1.5 py-0 font-normal text-2xs">
                      Optional
                    </Badge>
                  )}
                </FieldLabel>
              )}
              {description && (
                <FieldDescription>{description}</FieldDescription>
              )}
              <FieldContent>{children(field, hasError)}</FieldContent>
              {hint && <FieldDescription>{hint}</FieldDescription>}
            </Field>
          </AnimateItem>
        );
      }}
    </FormField>
  );
};

export default FieldShell;
