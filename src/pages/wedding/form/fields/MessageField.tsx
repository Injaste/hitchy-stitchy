import { MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";

import type { TextFieldProps } from "../types";
import FieldShell from "./FieldShell";

const MessageField = ({
  field: f,
  required,
  optionalLabel,
  classNames,
  labels,
  delay,
}: TextFieldProps) => {
  const override = classNames.fields?.message;

  return (
    <FieldShell
      name={f.name}
      label={labels.message.label}
      required={required}
      optionalLabel={optionalLabel}
      isInvalid={f.isInvalid}
      errors={f.errors}
      delay={delay}
      classNames={classNames}
      labels={labels}
    >
      <InputGroup
        className={cn(classNames.inputGroupTextarea, override?.inputGroup)}
      >
        <InputGroupAddon
          className={cn(
            classNames.inputAddonTextarea,
            override?.inputAddon,
          )}
        >
          <MessageSquare
            size={15}
            className={cn(classNames.inputIcon, override?.inputIcon)}
          />
        </InputGroupAddon>
        <InputGroupTextarea
          id={f.name}
          name={f.name}
          rows={2}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          onBlur={f.onBlur}
          aria-invalid={f.isInvalid}
          placeholder={labels.message.placeholder}
          className={cn(classNames.textarea, override?.textarea)}
        />
      </InputGroup>
    </FieldShell>
  );
};

export default MessageField;
