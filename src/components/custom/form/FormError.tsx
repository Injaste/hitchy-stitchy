import type { ReactNode } from "react";

import { AnimateItem } from "@/components/animations/forms/field-animate";
import { useFormShell } from "./form-context";

type SubmitError = Error | string | null | undefined;

interface FormErrorProps {
  /** The submit/mutation error to surface inline. */
  error?: SubmitError;
  /** Aggregated field-style errors, if surfacing those instead of a single error. */
  errors?: Array<{ message?: string } | undefined>;
  children?: ReactNode;
}

/**
 * Form-level submit error banner: expands/collapses the error message and
 * shakes on each submit attempt. Reads the live attempt count from form context
 * (the same source FieldShell uses), so call sites pass only the error — no
 * <form.Subscribe> plumbing.
 *
 * For the inline-error path: `silent: true` mutations that surface their own
 * message. Mutations that auto-toast (the default) don't use this. Must be
 * rendered inside a FormShell / FormCard / FormDialog provider.
 */
const FormError = ({ error, errors, children }: FormErrorProps) => {
  const { attemptCount } = useFormShell();
  const hasError = Boolean(error) || Boolean(errors?.some((e) => e?.message));

  return (
    <AnimateItem
      hasError={hasError}
      error={error ?? undefined}
      errors={errors}
      attemptCount={attemptCount}
    >
      {children}
    </AnimateItem>
  );
};

export default FormError;
