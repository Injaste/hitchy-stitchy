import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface DayLabelFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Create: the form field's handleBlur. Settings: commit (save) the label. */
  onBlur?: () => void;
  /** Settings only: commit on Enter. */
  onEnter?: () => void;
  error?: string | null;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
}

/**
 * The per-day label input + its inline error — shared by the create wizard
 * (form-bound) and Event Dates settings (commit on blur/enter). The error
 * reveals with the same height+opacity motion as the form-field errors.
 */
const DayLabelField: FC<DayLabelFieldProps> = ({
  value,
  onChange,
  onBlur,
  onEnter,
  error,
  placeholder,
  "aria-label": ariaLabel,
  className,
}) => (
  <div className={cn("min-w-0 flex-1", className)}>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={
        onEnter
          ? (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onEnter();
              }
            }
          : undefined
      }
      placeholder={placeholder}
      maxLength={60}
      aria-label={ariaLabel}
      aria-invalid={!!error || undefined}
      className={cn("h-8", error && "border-destructive")}
    />
    <AnimatePresence initial={false}>
      {error && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ overflow: "hidden" }}
          className="pt-1"
        >
          <FieldError>{error}</FieldError>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default DayLabelField;
