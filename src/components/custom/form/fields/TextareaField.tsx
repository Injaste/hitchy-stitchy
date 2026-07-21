import type { ComponentProps, ReactNode } from "react";
import { Textarea } from "@/components/ui/textarea";
import FieldShell from "./FieldShell";

type NativeTextareaProps = Omit<
  ComponentProps<"textarea">,
  "name" | "value" | "onChange" | "onBlur" | "defaultValue"
>;

interface TextareaFieldProps extends NativeTextareaProps {
  name: string;
  label: ReactNode;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  transform?: (value: string) => string;
}

const TextareaField = ({
  name,
  label,
  optional,
  description,
  hint,
  transform,
  rows = 2,
  ...textareaProps
}: TextareaFieldProps) => (
  <FieldShell
    name={name}
    label={label}
    optional={optional}
    description={description}
    hint={hint}
  >
    {(field, _hasError, { controlProps }) => (
      <Textarea
        {...textareaProps}
        {...controlProps}
        rows={rows}
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

export default TextareaField;
