import { Users } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import type { NumberFieldProps } from "../types";
import FieldShell from "./FieldShell";

const GuestCountField = ({
  field: f,
  required,
  optionalLabel,
  classNames,
  labels,
  delay,
}: NumberFieldProps) => {
  const override = classNames.fields?.guestCount;

  return (
    <FieldShell
      name={f.name}
      label={labels.guestCount.label}
      required={required}
      optionalLabel={optionalLabel}
      isInvalid={f.isInvalid}
      errors={f.errors}
      delay={delay}
      classNames={classNames}
      labels={labels}
    >
      <InputGroup className={cn(classNames.inputGroup, override?.inputGroup)}>
        <InputGroupInput
          id={f.name}
          name={f.name}
          type="number"
          inputMode="numeric"
          min={f.min}
          max={f.max}
          value={f.value}
          onChange={(e) => f.onChange(Number(e.target.value))}
          onBlur={f.onBlur}
          aria-invalid={f.isInvalid}
          placeholder={labels.guestCount.placeholder(f.max)}
          className={cn(classNames.input, override?.input)}
        />
        <InputGroupAddon
          className={cn(classNames.inputAddon, override?.inputAddon)}
        >
          <Users
            size={15}
            className={cn(classNames.inputIcon, override?.inputIcon)}
          />
        </InputGroupAddon>
      </InputGroup>
    </FieldShell>
  );
};

export default GuestCountField;
