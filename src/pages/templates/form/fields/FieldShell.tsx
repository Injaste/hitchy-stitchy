import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { fieldVariant } from "../animations";
import type { RSVPFormClassNames, RSVPFormLabels } from "../types";

interface FieldShellProps {
  name: string;
  label: string;
  required: boolean;
  optionalLabel?: string;
  isInvalid: boolean;
  errors: Array<{ message?: string } | undefined>;
  delay: number;
  classNames: RSVPFormClassNames;
  labels: RSVPFormLabels;
  children: ReactNode;
}

const FieldShell = ({
  name,
  label,
  required,
  optionalLabel,
  isInvalid,
  errors,
  delay,
  classNames,
  labels,
  children,
}: FieldShellProps) => {
  return (
    <motion.div
      variants={fieldVariant}
      custom={delay}
      className={classNames.fieldWrapper}
    >
      <Field data-invalid={isInvalid} className={classNames.field}>
        <FieldLabel htmlFor={name} className={classNames.fieldLabel}>
          {label}
          {required ? (
            <span className={classNames.fieldRequiredMark}>
              {labels.required}
            </span>
          ) : optionalLabel ? (
            <span className={classNames.fieldOptionalMark}>{optionalLabel}</span>
          ) : null}
        </FieldLabel>
        {children}
        {isInvalid && (
          <FieldError errors={errors} className={cn(classNames.fieldError)} />
        )}
      </Field>
    </motion.div>
  );
};

export default FieldShell;
