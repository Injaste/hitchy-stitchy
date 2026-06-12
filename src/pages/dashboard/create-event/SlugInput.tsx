import {
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import {
  useSlugCheck,
  toSafeSlug,
  toSlug,
  type SlugStatus,
} from "@/hooks/useSlugCheck";

// Live (non-schema) rejections surfaced by the reserve check. Format errors are
// left to the form's own validation, which shakes the field on Continue.
const STATUS_MESSAGE: Partial<Record<SlugStatus, string>> = {
  taken: "That URL's already taken — try another.",
  error: "Couldn't check that URL — try again.",
};

// ─── Exported handle ──────────────────────────────────────────────────────────

export interface SlugInputHandle {
  /** Debounced availability check — call whenever the parent changes the value. */
  scheduleCheck: (slug: string) => void;
  /** Immediate availability check — call before form submit. Returns true if taken. */
  checkNow: (slug: string) => Promise<boolean>;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function SlugStatusIcon({ status }: { status: SlugStatus }) {
  if (status === "checking")
    return <Loader2 className="size-4.5 animate-spin text-muted-foreground" />;
  if (status === "available")
    return <CheckCircle2 className="size-4.5 text-success" />;
  if (status === "taken")
    return <XCircle className="size-4.5 text-destructive" />;
  if (status === "error")
    return <AlertCircle className="size-4.5 text-warning" />;
  return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  /**
   * Called after the input blurs. Receives the final normalised slug value so
   * the parent can handle the empty case (e.g. auto-generate from event name)
   * without needing to read potentially-stale closure state.
   */
  onBlur?: (currentValue: string) => void;
  /** Fired whenever the slug's taken status changes. Drive error display in the parent. */
  onTakenChange?: (taken: boolean) => void;
  /** Fired with the hold's expiry (ISO) + slug when reserved (on availability). */
  onReserved?: (expiry: string, slug: string) => void;
  invalid?: boolean;
  placeholder?: string;
  id?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SlugInput = forwardRef<SlugInputHandle, SlugInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      onTakenChange,
      onReserved,
      invalid,
      placeholder = "e.g. my-wedding",
      id,
    },
    ref,
  ) => {
    const { status, scheduleCheck, checkNow } = useSlugCheck({ onReserved });
    const isError = status === "taken" || status === "error";

    useEffect(() => {
      onTakenChange?.(status === "taken");
    }, [status]);

    useImperativeHandle(ref, () => ({ scheduleCheck, checkNow }), [
      scheduleCheck,
      checkNow,
    ]);

    // Each check sets "checking" before its result, so hasError dips between
    // consecutive failures — the shake re-fires per check off that toggle alone.
    return (
      <AnimateItem
        hasError={isError}
        attemptCount={0}
        error={STATUS_MESSAGE[status] ?? null}
      >
        <InputGroup>
          <InputGroupInput
            id={id}
            placeholder={placeholder}
            value={value}
            aria-invalid={invalid || undefined}
            onChange={(e) => {
              const safe = toSafeSlug(e.target.value);
              onChange(safe);
              scheduleCheck(safe);
            }}
            onBlur={(e) => {
              const normalized = toSlug(e.target.value);
              if (normalized !== value) {
                onChange(normalized);
                scheduleCheck(normalized);
              }
              onBlur?.(normalized);
            }}
          />
          <InputGroupAddon align="inline-end">
            <SlugStatusIcon status={status} />
          </InputGroupAddon>
        </InputGroup>
      </AnimateItem>
    );
  },
);

SlugInput.displayName = "SlugInput";

export default SlugInput;
