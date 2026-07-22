import { useRef, type KeyboardEvent, type ReactNode } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import FieldShell, { type FieldA11y } from "./FieldShell";

// Popular consumer domains, in the order we prefer when a partial prefixes more
// than one (e.g. "@h" → hotmail before nothing; "@o" → outlook). First match wins.
const DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
];

/** The greyed completion for what's typed so far, or null when nothing to offer.
 *  Only kicks in once there's a local part, a single "@", and a non-empty domain
 *  prefix that starts one of the known domains — matched case-insensitively. */
function ghostFor(value: string): { suffix: string; completed: string } | null {
  const at = value.indexOf("@");
  if (at <= 0) return null; // need a local part and an "@"
  if (value.indexOf("@", at + 1) !== -1) return null; // a second "@" → give up

  const partial = value.slice(at + 1);
  if (!partial) return null; // just typed "@" — wait for the first letter

  const lower = partial.toLowerCase();
  const domain = DOMAINS.find(
    (d) => d.startsWith(lower) && d.length > lower.length,
  );
  if (!domain) return null;

  const suffix = domain.slice(partial.length);
  return { suffix, completed: value.slice(0, at + 1) + domain };
}

type NativeInputProps = Omit<
  React.ComponentProps<"input">,
  "name" | "value" | "onChange" | "onBlur" | "defaultValue" | "type"
>;

interface EmailFieldProps extends NativeInputProps {
  name: string;
  label?: ReactNode;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  labelClassName?: string;
}

interface EmailControlProps {
  field: AnyFieldApi;
  controlProps: FieldA11y["controlProps"];
  inputProps: NativeInputProps;
}

const EmailControl = ({ field, controlProps, inputProps }: EmailControlProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const value = (field.state.value as string | null | undefined) ?? "";
  const ghost = ghostFor(value);

  const accept = () => {
    if (!ghost) return;
    field.handleChange(ghost.completed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!ghost) return;
    const input = inputRef.current;
    const atEnd =
      input?.selectionStart === value.length &&
      input?.selectionEnd === value.length;

    // Tab accepts from anywhere; ArrowRight only when the caret sits at the very
    // end (otherwise it's a normal in-field cursor move).
    if (e.key === "Tab" || (e.key === "ArrowRight" && atEnd)) {
      e.preventDefault();
      accept();
    }
  };

  return (
    <div className="relative">
      <Input
        {...inputProps}
        {...controlProps}
        ref={inputRef}
        type="email"
        value={value}
        onChange={(e) => field.handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={field.handleBlur}
      />
      {/* Ghost overlay: an invisible copy of the typed text reserves the exact
          width, so the muted suffix lines up right after the caret. Sits on top
          of the (transparent) input but ignores pointer/selection. */}
      {ghost && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center select-none",
            "overflow-hidden whitespace-pre px-2.5 md:text-sm",
          )}
        >
          <span className="invisible">{value}</span>
          <span className="text-muted-foreground">{ghost.suffix}</span>
        </div>
      )}
    </div>
  );
};

const EmailField = ({
  name,
  label,
  optional,
  description,
  hint,
  labelClassName,
  ...inputProps
}: EmailFieldProps) => (
  <FieldShell
    name={name}
    label={label}
    optional={optional}
    description={description}
    hint={hint}
    labelClassName={labelClassName}
  >
    {(field, _hasError, { controlProps }) => (
      <EmailControl
        field={field}
        controlProps={controlProps}
        inputProps={inputProps}
      />
    )}
  </FieldShell>
);

export default EmailField;
