import { useState } from "react";
import { format, eachDayOfInterval } from "date-fns";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { CalendarIcon, Pencil, X, AlertTriangle } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { AnimatePresence, motion } from "framer-motion";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useUpdateEventMutation } from "./queries";
import { fadeUp } from "@/pages/admin/animations";
import { formatDateRange } from "@/lib/utils/utils-time";
import { useIsMobile } from "@/hooks/use-mobile";

const schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name too long."),
  date_start: z.string().min(1, "Please select event dates."),
  date_end: z.string().min(1, "Please select event dates."),
});

function DisplayRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function EventSettingsSection() {
  const { eventName, eventId, dateStart, dateEnd } = useAdminStore();
  const isMobile = useIsMobile();
  const [editing, setEditing] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(dateStart),
    to: new Date(dateEnd),
  });

  const form = useForm({
    defaultValues: {
      name: eventName,
      date_start: format(dateStart, "yyyy-MM-dd"),
      date_end: format(dateEnd, "yyyy-MM-dd"),
    },
    validators: {
      onSubmit: schema,
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      if (!eventId) return;
    },
  });

  // Check if selected range would shrink below occupied days
  const showShrinkWarning = true;

  const dateLabel =
    dateRange?.from && dateRange?.to
      ? formatDateRange(
          dateRange.from.toISOString(),
          dateRange.to.toISOString(),
        )
      : "Pick event dates";

  const handleCancel = () => {
    setEditing(false);
    setAttemptCount(0);
    setDateRange({
      from: new Date(dateStart),
      to: new Date(dateEnd),
    });
    form.reset();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((p) => p + 1);
    form.handleSubmit();
  };

  return (
    <Card className="max-w-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Event Details</CardTitle>
        {!editing && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup className="block space-y-4">
            {/* Event name */}
            <form.Field name="name">
              {(field) => {
                const hasError =
                  Boolean(field.state.meta.errors.length) && attemptCount > 0;
                return (
                  <AnimateItem
                    errors={field.state.meta.errors}
                    hasError={hasError}
                    attemptCount={attemptCount}
                  >
                    <Field data-invalid={hasError} className="gap-2">
                      <FieldLabel htmlFor="event-name">Event Name</FieldLabel>
                      <FieldContent>
                        <Input
                          id="event-name"
                          placeholder="e.g. Dan & Nad Wedding"
                          value={field.state.value}
                          mode={editing ? "edit" : "readonly"}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          autoFocus
                        />
                      </FieldContent>
                    </Field>
                  </AnimateItem>
                );
              }}
            </form.Field>

            {/* Date range */}
            <form.Field name="date_start">
              {(field) => {
                const hasError =
                  Boolean(field.state.meta.errors.length) && attemptCount > 0;
                return (
                  <AnimateItem
                    errors={field.state.meta.errors}
                    hasError={hasError}
                    attemptCount={attemptCount}
                  >
                    <Field data-invalid={hasError} className="gap-2">
                      <FieldLabel>Event Dates</FieldLabel>
                      <FieldContent>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start gap-2 font-normal"
                            >
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{dateLabel}</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              selected={dateRange}
                              onSelect={(range) => {
                                setDateRange(range);
                                form.setFieldValue(
                                  "date_start",
                                  range?.from
                                    ? format(range.from, "yyyy-MM-dd")
                                    : "",
                                );
                                form.setFieldValue(
                                  "date_end",
                                  range?.to
                                    ? format(range.to, "yyyy-MM-dd")
                                    : "",
                                );
                              }}
                              numberOfMonths={isMobile ? 1 : 2}
                            />
                          </PopoverContent>
                        </Popover>

                        {/* Timeline shrink warning */}
                        <AnimatePresence>
                          {showShrinkWarning && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-start gap-2 mt-2 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800"
                            >
                              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                              <p className="text-xs leading-snug">
                                This range is shorter than your current
                                timeline. <strong>3 days</strong> have events —
                                shrinking may orphan them.
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </FieldContent>
                    </Field>
                  </AnimateItem>
                );
              }}
            </form.Field>
          </FieldGroup>

          {/* Actions */}
          {editing && (
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm">
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
