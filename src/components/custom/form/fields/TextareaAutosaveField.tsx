import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { useAutosaveField } from "../useAutosaveField";

interface TextareaAutosaveFieldProps {
  /** Canonical saved value (source of truth). */
  saved: string;
  /** Persist a valid, changed value (already trimmed) — fire your mutation here. */
  onSave: (value: string) => void;
  /** Return an error string for an invalid (trimmed) value, or null if ok. */
  validate?: (value: string) => string | null;
  /** Observe the live value (typing + late re-seed) — e.g. to drive a preview. */
  onValueChange?: (value: string) => void;
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  id?: string;
  maxLength?: number;
  rows?: number;
  /** Tokens shown as chips that insert at the cursor (e.g. "{link}"). */
  insertables?: string[];
}

/**
 * Multi-line sibling of NameField — a self-contained textarea that AUTO-SAVES
 * (debounced change + blur flush via useAutosaveField), rejects invalid values
 * inline (shake + FieldError), and re-seeds when `saved` loads late. Unlike
 * NameField it does NOT flush on Enter (Enter is a newline here). Standalone (no
 * form context); shows a live character counter when maxLength is set, and can
 * report its value up via onValueChange (a live preview needs it).
 */
const TextareaAutosaveField = ({
  saved,
  onSave,
  validate,
  onValueChange,
  label,
  description,
  placeholder,
  id = "textarea-field",
  maxLength,
  rows = 3,
  insertables,
}: TextareaAutosaveFieldProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { value, error, attemptCount, onChange, flush } = useAutosaveField({
    saved,
    onSave,
    validate,
  });

  useEffect(() => {
    onValueChange?.(value);
  }, [value, onValueChange]);

  // Splice a token in at the caret (or append if the textarea isn't focused),
  // then restore focus + caret after the token. Skips inserts that would overflow.
  const insertToken = (token: string) => {
    const el = textareaRef.current;
    const focused = !!el && document.activeElement === el;
    const start = focused ? (el.selectionStart ?? value.length) : value.length;
    const end = focused ? (el.selectionEnd ?? value.length) : value.length;
    const next = value.slice(0, start) + token + value.slice(end);
    if (maxLength != null && next.length > maxLength) return;
    onChange(next);
    requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (!node) return;
      node.focus();
      const pos = start + token.length;
      node.setSelectionRange(pos, pos);
    });
  };

  return (
    <AnimateItem error={error} hasError={!!error} attemptCount={attemptCount}>
      <Field data-invalid={!!error || undefined} className="gap-2">
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        <FieldContent>
          {description && <FieldDescription>{description}</FieldDescription>}
          <Textarea
            ref={textareaRef}
            id={id}
            value={value}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={rows}
            aria-invalid={!!error || undefined}
            onChange={(e) => onChange(e.target.value)}
            onBlur={flush}
          />
          {(!!insertables?.length || maxLength != null) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {!!insertables?.length && (
                <>
                  <span className="text-2xs text-muted-foreground">Insert:</span>
                  {insertables.map((token) => (
                    <button
                      key={token}
                      type="button"
                      // Keep the textarea focused so the caret position is preserved.
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertToken(token)}
                      className="cursor-pointer rounded bg-muted px-1.5 py-0.5 font-mono text-2xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {token}
                    </button>
                  ))}
                </>
              )}
              {maxLength != null && (
                <span className="ml-auto shrink-0 text-2xs tabular-nums text-muted-foreground">
                  {value.length}/{maxLength}
                </span>
              )}
            </div>
          )}
        </FieldContent>
      </Field>
    </AnimateItem>
  );
};

export default TextareaAutosaveField;
