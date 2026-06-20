import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { useAutosaveField } from "../useAutosaveField";

interface NameFieldProps {
  /** Canonical saved value (source of truth). */
  saved: string;
  /** Persist a valid, changed value (already trimmed) — fire your mutation here. */
  onSave: (value: string) => void;
  label?: ReactNode;
  placeholder?: string;
  id?: string;
  minLength?: number;
  maxLength?: number;
  "aria-label"?: string;
}

/**
 * A self-contained name input that AUTO-SAVES — no Save button. Saves on a
 * debounced change and flushes on blur/Enter (via useAutosaveField); too-short is
 * rejected inline, unchanged is a no-op. The consumer only supplies `saved` +
 * `onSave`, never wires onChange/onBlur. Shared by the account profile name and
 * the per-event member display name.
 *
 * Built on the same primitives as FieldShell — AnimateItem (shake + animated
 * FieldError) wrapping a Field — but standalone (no form context), since the
 * value/error come from the autosave hook rather than a TanStack form.
 */
const NameField = ({
  saved,
  onSave,
  label,
  placeholder = "Your name",
  id = "name",
  minLength = 2,
  maxLength = 50,
  "aria-label": ariaLabel,
}: NameFieldProps) => {
  const { value, error, attemptCount, onChange, flush } = useAutosaveField({
    saved,
    onSave,
    validate: (v) => {
      if (v.length >= minLength) return null;
      return minLength <= 1
        ? "Name is required."
        : `Name must be at least ${minLength} characters.`;
    },
  });

  return (
    <AnimateItem error={error} hasError={!!error} attemptCount={attemptCount}>
      <Field data-invalid={!!error || undefined} className="gap-2">
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        <FieldContent>
          <Input
            id={id}
            value={value}
            placeholder={placeholder}
            maxLength={maxLength}
            aria-label={ariaLabel}
            aria-invalid={!!error || undefined}
            onChange={(e) => onChange(e.target.value)}
            onBlur={flush}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur(); // blur triggers flush
              }
            }}
          />
        </FieldContent>
      </Field>
    </AnimateItem>
  );
};

export default NameField;
