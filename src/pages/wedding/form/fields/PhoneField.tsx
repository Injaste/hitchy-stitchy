import { Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import type { TextFieldProps } from "../types";
import FieldShell from "./FieldShell";

const PhoneField = ({
  field: f,
  required,
  optionalLabel,
  classNames,
  labels,
  delay,
}: TextFieldProps) => {
  const override = classNames.fields?.phone;

  return (
    <FieldShell
      name={f.name}
      label={labels.phone.label}
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
          type="tel"
          inputMode="numeric"
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          onBlur={f.onBlur}
          aria-invalid={f.isInvalid}
          placeholder={labels.phone.placeholder}
          className={cn(classNames.input, override?.input)}
        />
        <InputGroupAddon
          className={cn(classNames.inputAddon, override?.inputAddon)}
        >
          <Phone
            size={15}
            className={cn(classNames.inputIcon, override?.inputIcon)}
          />
        </InputGroupAddon>
      </InputGroup>
    </FieldShell>
  );
};

export default PhoneField;
