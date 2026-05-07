import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import FieldShell from "./FieldShell";

type NativeInputProps = Omit<
  ComponentProps<"input">,
  "name" | "value" | "onChange" | "onBlur" | "defaultValue"
>;

interface TextFieldProps extends NativeInputProps {
  name: string;
  label: ReactNode;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  /** Transform raw input before writing to form state (e.g. `(v) => v.toUpperCase()`). */
  transform?: (value: string) => string;
}

const TextField = ({
  name,
  label,
  optional,
  description,
  hint,
  transform,
  type = "text",
  ...inputProps
}: TextFieldProps) => (
  <FieldShell
    name={name}
    label={label}
    optional={optional}
    description={description}
    hint={hint}
  >
    {(field) => (
      <Input
        {...inputProps}
        type={type}
        value={field.state.value ?? ""}
        onChange={(e) =>
          field.handleChange(
            transform ? transform(e.target.value) : e.target.value,
          )
        }
        onBlur={field.handleBlur}
      />
    )}
  </FieldShell>
);

export default TextField;
