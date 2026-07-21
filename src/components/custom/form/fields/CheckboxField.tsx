import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import FieldShell from "./FieldShell";

interface CheckboxFieldProps {
  name: string;
  /** Content shown beside the checkbox — may include links/markup. */
  label: ReactNode;
  description?: ReactNode;
  hint?: ReactNode;
  /** Class for the checkbox + label row. */
  className?: string;
  labelClassName?: string;
}

const CheckboxField = ({
  name,
  label,
  description,
  hint,
  className,
  labelClassName,
}: CheckboxFieldProps) => (
  <FieldShell name={name} description={description} hint={hint}>
    {(field, _hasError, { controlProps }) => (
      <div className={cn("flex items-start gap-2", className)}>
        <Checkbox
          {...controlProps}
          checked={!!field.state.value}
          onCheckedChange={(v) => field.handleChange(v === true)}
          onBlur={field.handleBlur}
        />
        <Label
          htmlFor={controlProps.id}
          className={cn(
            "text-xs font-normal leading-snug text-muted-foreground select-none",
            labelClassName,
          )}
        >
          {/* Wrap in one element so the Label's flex `gap` doesn't space out
              multi-part labels (text + link + punctuation). */}
          <span>{label}</span>
        </Label>
      </div>
    )}
  </FieldShell>
);

export default CheckboxField;
