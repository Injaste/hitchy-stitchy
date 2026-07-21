import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

import FieldShell from "./FieldShell";

interface PasswordFieldProps {
  name: string;
  label?: ReactNode;
  placeholder?: string;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  autoComplete?: string;
}

const PasswordField = ({
  name,
  label,
  placeholder,
  optional,
  description,
  hint,
  autoComplete = "current-password",
}: PasswordFieldProps) => {
  const [show, setShow] = useState(false);

  return (
    <FieldShell
      name={name}
      label={label}
      optional={optional}
      description={description}
      hint={hint}
    >
      {(field, _hasError, { controlProps }) => (
        <InputGroup>
          <InputGroupInput
            {...controlProps}
            type={show ? "text" : "password"}
            placeholder={placeholder}
            autoComplete={autoComplete}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShow((p) => !p)}
              onMouseLeave={() => setShow(false)}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      )}
    </FieldShell>
  );
};

export default PasswordField;

// TODO autofill complete, overlays ontop of the group instead of within the group boundary container
