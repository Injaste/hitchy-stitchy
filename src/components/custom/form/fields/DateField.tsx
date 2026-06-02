import { useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fieldRing, fieldSurface } from "@/components/ui/field-styles";
import { cn } from "@/lib/utils";
import FieldShell from "./FieldShell";

interface DateFieldProps {
  name: string;
  label: ReactNode;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  placeholder?: string;
  clearable?: boolean;
}

const DateField = ({
  name,
  label,
  optional,
  description,
  hint,
  placeholder = "Pick a date",
  clearable = true,
}: DateFieldProps) => {
  const [open, setOpen] = useState(false);

  return (
    <FieldShell
      name={name}
      label={label}
      optional={optional}
      description={description}
      hint={hint}
    >
      {(field, hasError) => {
        const value: string | null = field.state.value ?? null;
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-invalid={hasError || undefined}
                // data-[state=open] ring opacity (/70) mirrors fieldRing in field-styles.ts — keep in sync.
                className={cn(
                  fieldSurface,
                  fieldRing,
                  "flex h-9 w-full cursor-pointer items-center gap-2 px-2.5 text-sm data-[state=open]:border-ring data-[state=open]:ring-3 data-[state=open]:ring-ring/70",
                )}
              >
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className={value ? "" : "text-muted-foreground"}>
                  {value ? format(parseISO(value), "d MMM yyyy") : placeholder}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? parseISO(value) : undefined}
                onSelect={(date) => {
                  field.handleChange(date ? format(date, "yyyy-MM-dd") : null);
                  setOpen(false);
                }}
              />
              {clearable && value && (
                <div className="border-t border-border/50 p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground text-xs h-7"
                    onClick={() => {
                      field.handleChange(null);
                      setOpen(false);
                    }}
                  >
                    Clear date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        );
      }}
    </FieldShell>
  );
};

export default DateField;
