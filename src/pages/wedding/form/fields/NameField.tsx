import { User } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import type { TextFieldProps } from "../types";
import FieldShell from "./FieldShell";

const NameField = ({ field: f, classNames, labels, delay }: TextFieldProps) => {
  const override = classNames.fields?.name;

  return (
    <FieldShell
      name={f.name}
      label={labels.name.label}
      required
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
          type="text"
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          onBlur={f.onBlur}
          aria-invalid={f.isInvalid}
          placeholder={labels.name.placeholder}
          autoComplete="off"
          className={cn(classNames.input, override?.input)}
        />
        <InputGroupAddon
          className={cn(classNames.inputAddon, override?.inputAddon)}
        >
          <User
            size={15}
            className={cn(classNames.inputIcon, override?.inputIcon)}
          />
        </InputGroupAddon>
      </InputGroup>
    </FieldShell>
  );
};

export default NameField;
