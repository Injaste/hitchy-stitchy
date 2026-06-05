import type { ComponentProps, ReactNode } from "react";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import FieldShell from "./FieldShell";

type NativeInputProps = Omit<
  ComponentProps<"input">,
  "name" | "value" | "onChange" | "onBlur" | "defaultValue" | "type"
>;

interface TimeFieldProps extends NativeInputProps {
  name: string;
  label: ReactNode;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  /** Show a clear (×) button when the field has a value. */
  clearable?: boolean;
}

const TimeField = ({
  name,
  label,
  optional,
  description,
  hint,
  className,
  clearable,
  ...inputProps
}: TimeFieldProps) => (
  <FieldShell
    name={name}
    label={label}
    optional={optional}
    description={description}
    hint={hint}
  >
    {(field) => (
      <InputGroup>
        <InputGroupAddon>
          <Clock className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          {...inputProps}
          type="time"
          value={field.state.value ?? ""}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          className={cn(
            "[&::-webkit-calendar-picker-indicator]:hidden",
            className,
          )}
        />
        {clearable && field.state.value && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="Clear time"
              onClick={() => field.handleChange("")}
            >
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    )}
  </FieldShell>
);

export default TimeField;
