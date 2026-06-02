import { useEffect, useMemo, useRef, useState } from "react";

import { type FormShellContextValue } from "./form-context";

interface UseFormCoreOpts {
  form: FormShellContextValue["form"];
  isPending?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  resetOnSuccess?: boolean;
  inDialog?: boolean;
}

/** Shared behaviour between FormDialog and FormCard. */
export function useFormCore({
  form,
  isPending = false,
  isSuccess = false,
  isError = false,
  resetOnSuccess = false,
  inDialog = false,
}: UseFormCoreOpts) {
  const [attemptCount, setAttemptCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Scroll to and focus the first errored field after each submit attempt.
  useEffect(() => {
    if (attemptCount === 0) return;
    const id = requestAnimationFrame(() => {
      const firstInvalid = formRef.current?.querySelector('[data-invalid="true"]');
      if (!firstInvalid) return;
      const focusable = firstInvalid.querySelector<HTMLElement>(
        'input, textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
      focusable?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(id);
  }, [attemptCount]);

  // Reset and refocus when resetOnSuccess is set.
  useEffect(() => {
    if (!isSuccess || !resetOnSuccess) return;
    setAttemptCount(0);
    form.reset();
    const id = requestAnimationFrame(() => {
      const first = formRef.current?.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]',
      );
      first?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [isSuccess, resetOnSuccess]);

  const submit = () => {
    setAttemptCount((c) => c + 1);
    form.handleSubmit();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    submit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  // Stable reference so context consumers don't re-render unnecessarily.
  const contextValue = useMemo<FormShellContextValue>(
    () => ({ attemptCount, form, isPending, isSuccess, isError, inDialog }),
    [attemptCount, form, isPending, isSuccess, isError, inDialog],
  );

  return { formRef, attemptCount, setAttemptCount, contextValue, handleSubmit, handleKeyDown };
}
