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
      {(field) => {
        const value: string | null = field.state.value ?? null;
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 font-normal hover:bg-transparent aria-expanded:bg-transparent"
              >
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className={value ? "" : "text-muted-foreground"}>
                  {value ? format(parseISO(value), "d MMM yyyy") : placeholder}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
