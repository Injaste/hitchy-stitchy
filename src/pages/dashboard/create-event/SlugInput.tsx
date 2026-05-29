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
import {
  useSlugCheck,
  toSafeSlug,
  toSlug,
  type SlugStatus,
} from "@/hooks/useSlugCheck";

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
      invalid,
      placeholder = "e.g. my-wedding",
      id,
    },
    ref,
  ) => {
    const { status, scheduleCheck, checkNow } = useSlugCheck();

    useEffect(() => {
      onTakenChange?.(status === "taken");
    }, [status]);

    useImperativeHandle(ref, () => ({ scheduleCheck, checkNow }), [
      scheduleCheck,
      checkNow,
    ]);

    return (
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
    );
  },
);

SlugInput.displayName = "SlugInput";

export default SlugInput;
