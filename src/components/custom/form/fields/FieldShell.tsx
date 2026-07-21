import type { AnyFieldApi } from "@tanstack/react-form";
import { useId, type ReactNode } from "react";
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

/** The a11y wiring FieldShell hands each field so the label, description, hint
 *  and error actually associate with the control. `controlProps` spreads onto a
 *  single focusable control (input / trigger); `labelId` is for GROUP controls
 *  (no single element) that associate via aria-labelledby instead. */
export interface FieldA11y {
  controlProps: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": true | undefined;
  };
  labelId: string;
}

export interface FieldShellProps {
  name: string;
  label?: ReactNode;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  fieldClassName?: string;
  labelClassName?: string;
  /** Control pinned to the far end of the LABEL row — for an action that creates
   *  what the field selects ("+ New vendor"). Rendered as the label's sibling,
   *  never inside it, so clicking it doesn't trigger the label's focus behaviour. */
  labelAction?: ReactNode;
  /** An imperative/async error (e.g. an upload failure) shown via the same
   *  animated FieldError as validation errors. */
  error?: string | null;
  children: (field: AnyFieldApi, hasError: boolean, a11y: FieldA11y) => ReactNode;
}

const FieldShell = ({
  name,
  label,
  optional,
  description,
  hint,
  fieldClassName,
  labelClassName,
  labelAction,
  error,
  children,
}: FieldShellProps) => {
  const { attemptCount, form } = useFormShell();
  const FormField = form.Field;

  // One stable base id per field → the control id, plus derived ids for the
  // label, description, hint and error so htmlFor / aria-describedby resolve.
  const uid = useId();
  const labelId = `${uid}-label`;
  const descId = `${uid}-desc`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  return (
    <FormField name={name}>
      {(field: AnyFieldApi) => {
        const hasError =
          (!!field.state.meta.errors.length && attemptCount > 0) || !!error;

        // Only reference ids that are actually rendered (the error only when
        // shown), so aria-describedby never points at a missing node.
        const describedBy =
          [
            description ? descId : null,
            hint ? hintId : null,
            hasError ? errorId : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined;

        const a11y: FieldA11y = {
          controlProps: {
            id: uid,
            "aria-describedby": describedBy,
            "aria-invalid": hasError || undefined,
          },
          labelId,
        };

        return (
          <AnimateItem
            errors={field.state.meta.errors}
            error={error}
            hasError={hasError}
            errorId={errorId}
            attemptCount={attemptCount}
          >
            <Field
              data-invalid={hasError}
              className={cn("gap-2", fieldClassName)}
            >
              {label && (
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel htmlFor={uid} id={labelId} className={labelClassName}>
                    {label}
                    {optional && (
                      <Badge variant="outline" className="h-4 px-1.5 py-0 font-normal text-2xs">
                        Optional
                      </Badge>
                    )}
                  </FieldLabel>
                  {labelAction}
                </div>
              )}
              {description && (
                <FieldDescription id={descId}>{description}</FieldDescription>
              )}
              <FieldContent>{children(field, hasError, a11y)}</FieldContent>
              {hint && <FieldDescription id={hintId}>{hint}</FieldDescription>}
            </Field>
          </AnimateItem>
        );
      }}
    </FormField>
  );
};

export default FieldShell;
