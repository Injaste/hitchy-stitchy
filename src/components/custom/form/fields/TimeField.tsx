import type { ComponentProps, ReactNode } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
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
}

const TimeField = ({
  name,
  label,
  optional,
  description,
  hint,
  className,
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
      </InputGroup>
    )}
  </FieldShell>
);

export default TimeField;
