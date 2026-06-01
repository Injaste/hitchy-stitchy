import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import FieldShell from "./FieldShell";

type NativeInputProps = Omit<
  ComponentProps<"input">,
  "name" | "value" | "onChange" | "onBlur" | "defaultValue"
>;

interface TextFieldProps extends NativeInputProps {
  name: string;
  label?: ReactNode;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  labelClassName?: string;
  transform?: (value: string) => string;
  /** Called with the new value on every change, alongside the form's own handleChange. */
  onValueChange?: (value: string) => void;
}

const TextField = ({
  name,
  label,
  optional,
  description,
  hint,
  labelClassName,
  transform,
  onValueChange,
  type = "text",
  ...inputProps
}: TextFieldProps) => (
  <FieldShell
    name={name}
    label={label}
    optional={optional}
    description={description}
    hint={hint}
    labelClassName={labelClassName}
  >
    {(field) => (
      <Input
        {...inputProps}
        type={type}
        value={field.state.value ?? ""}
        onChange={(e) => {
          const v = transform ? transform(e.target.value) : e.target.value;
          field.handleChange(v);
          onValueChange?.(v);
        }}
        onBlur={field.handleBlur}
      />
    )}
  </FieldShell>
);

export default TextField;
