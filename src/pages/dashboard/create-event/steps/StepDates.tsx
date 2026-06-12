import { type FC, useRef } from "react";
import { format, addDays } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useForm, useStore, type AnyFieldApi } from "@tanstack/react-form";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldGroup } from "@/components/ui/field";
import {
  FormShell,
  FieldShell,
  SubmitButton,
  DayLabelField,
} from "@/components/custom/form";
import { useFormShell } from "@/components/custom/form/form-context";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import { useSteps } from "@/components/custom/steps-direction";
import { parseLocalDate } from "@/lib/utils/utils-time";
import { gappedListItemReveal, listLayoutTransition } from "@/lib/animations";

import {
  stepDatesSchema,
  type StepDatesFormValues,
  type EventDayInput,
  type CreateDatesData,
  type StepType,
} from "../../types";

// One picked day — date + the shared label field + remove. The per-day error
// shows once touched, or after a submit attempt that happened *after* this row
// was added — so a freshly-picked date doesn't appear pre-errored just because
// an earlier submit bumped the form's attemptCount. Animates in/out by height.
const CreateDayRow: FC<{
  index: number;
  date: string;
  onRemove: () => void;
}> = ({ index, date, onRemove }) => {
  const { form, attemptCount } = useFormShell();
  // attemptCount at mount — only a later attempt should reveal this row's error.
  const mountAttempt = useRef(attemptCount).current;
  const dateText = format(parseLocalDate(date), "EEE, d MMM");

  return (
    <motion.li
      variants={gappedListItemReveal}
      initial="hidden"
      animate="show"
      exit="exit"
      transition={listLayoutTransition}
    >
      <form.Field name={`days[${index}].label`}>
        {(f: AnyFieldApi) => {
          const showError =
            f.state.meta.isTouched || attemptCount > mountAttempt;
          const errorMsg = showError
            ? (f.state.meta.errors[0]?.message ?? null)
            : null;
          return (
            <AnimateItem
              hasError={!!errorMsg}
              attemptCount={attemptCount}
              className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 p-2"
            >
              <span className="min-w-24 px-1 text-sm text-muted-foreground">
                {dateText}
              </span>
              <DayLabelField
                value={f.state.value ?? ""}
                onChange={f.handleChange}
                onBlur={f.handleBlur}
                error={errorMsg}
                placeholder="e.g. Mehndi Night"
                aria-label={`Label for ${dateText}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                onClick={onRemove}
                aria-label={`Remove ${dateText}`}
              >
                <X className="size-4" />
              </Button>
            </AnimateItem>
          );
        }}
      </form.Field>
    </motion.li>
  );
};

interface StepDatesProps {
  defaultValues?: Partial<CreateDatesData>;
  onNext: (data: CreateDatesData) => void;
  onBack: (data: CreateDatesData) => void;
}

// A fresh wizard starts with two example days so the multi-day shape is obvious;
// dates and labels are all editable. Only used when nothing has been picked yet.
const seedDays = (): EventDayInput[] => {
  const today = new Date();
  return [
    { date: format(today, "yyyy-MM-dd"), label: "Reception" },
    { date: format(addDays(today, 1), "yyyy-MM-dd"), label: "Photoshoot" },
  ];
};

const StepDates: FC<StepDatesProps> = ({ defaultValues, onNext, onBack }) => {
  const { goTo } = useSteps<StepType>();

  const form = useForm({
    defaultValues: {
      days: defaultValues?.days ?? seedDays(),
    } as StepDatesFormValues,
    validators: {
      onSubmit: stepDatesSchema,
      onChange: stepDatesSchema,
    },
    onSubmit: async ({ value }) => {
      onNext({ days: value.days.map((d) => ({ date: d.date, label: d.label.trim() })) });
      goTo("Role");
    },
  });

  const days = useStore(form.store, (s) => s.values.days);

  const selectedDates = days.map((d) => parseLocalDate(d.date));

  // Merge a fresh calendar selection with existing rows so labels survive a
  // toggle, then keep the list chronological.
  const handleSelect = (dates: Date[] | undefined) => {
    const next: EventDayInput[] = (dates ?? [])
      .map((date) => {
        const key = format(date, "yyyy-MM-dd");
        return days.find((d) => d.date === key) ?? { date: key, label: "" };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    form.setFieldValue("days", next);
  };

  const removeDay = (date: string) =>
    form.setFieldValue(
      "days",
      days.filter((d) => d.date !== date),
    );

  return (
    <FormShell form={form} className="space-y-6">
      <FieldGroup>
        <FieldShell
          name="days"
          label="Event Days"
          hint="Pick each day of your celebration — they don't have to be back-to-back."
        >
          {(_field, hasError) => (
            <div className="space-y-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    data-invalid={hasError}
                    className="w-full justify-start gap-2 font-normal data-[invalid=true]:border-destructive"
                  >
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {days.length > 0
                      ? `${days.length} day${days.length > 1 ? "s" : ""} selected`
                      : "Pick your event days"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto bg-card p-0" align="start">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={handleSelect}
                    numberOfMonths={1}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>

              {days.length > 0 && (
                <ul>
                  <AnimatePresence initial={false}>
                    {days.map((day, i) => (
                      <CreateDayRow
                        key={day.date}
                        index={i}
                        date={day.date}
                        onRemove={() => removeDay(day.date)}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          )}
        </FieldShell>
      </FieldGroup>

      <div className="flex flex-col gap-3">
        {/* Sync advance — no async submit, so no pending state (see StepDetails). */}
        <SubmitButton size="lg" isPending={false} className="w-full">
          Continue
        </SubmitButton>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onBack({ days });
            goTo("Details");
          }}
          className="w-full text-muted-foreground"
        >
          Back
        </Button>
      </div>
    </FormShell>
  );
};

export default StepDates;
