import { useCallback, useEffect, useRef, useState } from "react";

interface UseAutosaveFieldOpts {
  /** The canonical saved value (source of truth). Re-seeds the field when it
   *  changes externally, unless the user has diverged (never clobbers typing). */
  saved: string;
  /** Persist a valid, changed value (already trimmed). Fire your mutation here. */
  onSave: (value: string) => void;
  /** Return an error string for an invalid (trimmed) value, or null if ok.
   *  Invalid values are never saved. */
  validate?: (value: string) => string | null;
  /** Debounce before an on-change save fires, in ms. Default 600. */
  delay?: number;
}

/**
 * Inline auto-save for a single text field — no Save button. Saves on a debounced
 * change (prominent on mobile, where blur is easy to miss) and flushes immediately
 * on blur/Enter. Skips unchanged values and rejects invalid ones inline. Powers
 * NameField and the Event Dates day label (DayRow).
 *
 * Wire it to any input:
 *   const { value, error, attemptCount, onChange, flush } = useAutosaveField({…})
 *   <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={flush} />
 *
 * `attemptCount` bumps on each rejected commit — feed it to a shake animation.
 */
export function useAutosaveField({
  saved,
  onSave,
  validate,
  delay = 600,
}: UseAutosaveFieldOpts) {
  const [value, setValueState] = useState(saved);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);
  const savedRef = useRef(saved);
  const onSaveRef = useRef(onSave);
  const validateRef = useRef(validate);
  onSaveRef.current = onSave;
  validateRef.current = validate;

  const setValue = (v: string) => {
    valueRef.current = v;
    setValueState(v);
  };

  // Adopt an external change to the canonical value, but only when the user
  // hasn't diverged (current value still equals the previously-known saved one).
  // So a late-loading value or an external update seeds in, while in-progress
  // typing — and the field's own just-saved value — is left untouched.
  useEffect(() => {
    if (valueRef.current === savedRef.current) setValue(saved);
    savedRef.current = saved;
  }, [saved]);

  // Cancel any pending save on unmount.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const commit = useCallback((next: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const trimmed = next.trim();
    const err = validateRef.current?.(trimmed) ?? null;
    if (err) {
      setError(err);
      setAttemptCount((c) => c + 1);
      return;
    }
    setError(null);
    if (trimmed === savedRef.current.trim()) return; // unchanged → no-op
    onSaveRef.current(trimmed);
  }, []);

  const onChange = useCallback(
    (next: string) => {
      setValue(next);
      setError(null);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => commit(next), delay);
    },
    [commit, delay],
  );

  // Save now (blur / Enter), skipping the debounce.
  const flush = useCallback(() => commit(valueRef.current), [commit]);

  return { value, error, attemptCount, onChange, flush };
}
