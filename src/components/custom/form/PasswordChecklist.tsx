import { cn } from "@/lib/utils";
import { PASSWORD_RULES } from "@/lib/password";
import AnimatedCheck from "@/components/custom/animated-check";
import { useFormShell } from "./form-context";

interface PasswordChecklistProps {
  /** Name of the password field to watch in the surrounding form. */
  name: string;
  className?: string;
}

/**
 * Live password-requirements checklist — each rule ticks green (with our animated
 * check) as it's met, and shows example characters as a hint. Reads the watched
 * field's value from the form context (must be inside a FormShell/FormCard/
 * FormDialog). Mirrors the Supabase policy via PASSWORD_RULES.
 */
const PasswordChecklist = ({ name, className }: PasswordChecklistProps) => {
  const { form } = useFormShell();

  return (
    <form.Subscribe selector={(s: any) => (s.values[name] as string) ?? ""}>
      {(value: string) => (
        <ul className={cn("grid gap-1.5", className)}>
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(value);
            return (
              <li
                key={rule.id}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  met ? "text-success" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                    met
                      ? "border-success bg-success text-white"
                      : "border-muted-foreground/40",
                  )}
                >
                  <AnimatedCheck checked={met} />
                </span>
                <span>{rule.label}</span>
                {rule.example && (
                  <span className="ml-auto font-mono text-2xs text-muted-foreground/70">
                    {rule.example}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </form.Subscribe>
  );
};

export default PasswordChecklist;
