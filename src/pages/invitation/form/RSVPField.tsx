import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const fieldVariant: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

interface RSVPFieldProps {
  delay: number;
  label: string;
  required: boolean;
  isInvalid: boolean;
  errors: Array<{ message?: string } | undefined>;
  children: ReactNode;
}

export function RSVPField({
  delay,
  label,
  required,
  isInvalid,
  errors,
  children,
}: RSVPFieldProps) {
  return (
    <motion.div variants={fieldVariant} custom={delay}>
      <Field data-invalid={isInvalid}>
        <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
          {required ? (
            <span className="text-destructive ml-0.5">*</span>
          ) : (
            <span className="ml-1 normal-case tracking-normal font-normal">(Optional)</span>
          )}
        </FieldLabel>
        {children}
        {isInvalid && (
          <FieldError
            errors={errors}
            className="text-[10px] font-bold uppercase tracking-wide"
          />
        )}
      </Field>
    </motion.div>
  );
}
