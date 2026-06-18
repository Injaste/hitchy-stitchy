import { KeyRound } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import type { TextFieldProps } from "../types";
import FieldShell from "./FieldShell";

const CodeField = ({
  field: f,
  required,
  optionalLabel,
  classNames,
  labels,
  delay,
}: TextFieldProps) => {
  const override = classNames.fields?.code;
  const codeLabels = labels.code ?? {
    label: "Invite code",
    placeholder: "Enter your invite code",
  };

  return (
    <FieldShell
      name={f.name}
      label={codeLabels.label}
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
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          onBlur={f.onBlur}
          aria-invalid={f.isInvalid}
          placeholder={codeLabels.placeholder}
          className={cn(classNames.input, override?.input)}
        />
        <InputGroupAddon
          className={cn(classNames.inputAddon, override?.inputAddon)}
        >
          <KeyRound
            size={15}
            className={cn(classNames.inputIcon, override?.inputIcon)}
          />
        </InputGroupAddon>
      </InputGroup>
    </FieldShell>
  );
};

export default CodeField;
