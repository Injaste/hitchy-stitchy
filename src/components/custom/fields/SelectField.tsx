import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FieldShell from "./FieldShell";

const NULL_SENTINEL = "__null__";

export interface SelectFieldOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SelectFieldProps {
  name: string;
  label: ReactNode;
  options: SelectFieldOption[];
  placeholder?: string;
  placeholderIcon?: ReactNode;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  /** When true, prepends a "None" option that maps to `null` in form state. */
  nullable?: boolean;
  /** Label for the null option. Defaults to "None". */
  nullLabel?: ReactNode;
}

const SelectField = ({
  name,
  label,
  options,
  placeholder,
  placeholderIcon,
  optional,
  description,
  hint,
  disabled,
  nullable,
  nullLabel = "None",
}: SelectFieldProps) => (
  <FieldShell
    name={name}
    label={label}
    optional={optional}
    description={description}
    hint={hint}
  >
    {(field) => {
      const raw = field.state.value;
      const triggerValue =
        raw === null || raw === undefined || raw === ""
          ? nullable
            ? NULL_SENTINEL
            : ""
          : raw;

      return (
        <Select
          value={triggerValue}
          onValueChange={(v) =>
            field.handleChange(v === NULL_SENTINEL ? null : v)
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-full" disabled={disabled}>
            {raw && raw !== NULL_SENTINEL ? (
              <SelectValue />
            ) : nullable ? (
              <SelectValue />
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {placeholderIcon}
                {placeholder && <span>{placeholder}</span>}
              </span>
            )}
          </SelectTrigger>
          <SelectContent position="popper">
            {nullable && (
              <SelectItem value={NULL_SENTINEL}>{nullLabel}</SelectItem>
            )}
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.icon}
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }}
  </FieldShell>
);

export default SelectField;
