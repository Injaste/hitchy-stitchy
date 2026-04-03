import { useState, useEffect } from "react";
import type { FC } from "react";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { AnimateItem } from "@/components/animations/forms/field-animate";
import type { CreateEventData, StepType } from "../types";
import type { DateRange } from "react-day-picker";
import OdometerDigit from "@/components/animations/animate-odometer-digit";
import { useSteps } from "@/components/custom/steps";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useCheckSlugMutation } from "../queries";

// ─── Schema ────────────────────────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

const stepEventSchema = z
  .object({
    display_name: z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(50, "Name must be less than 50 characters."),
    event_name: z
      .string()
      .min(3, "Event name must be at least 3 characters.")
      .max(50, "Event name must be less than 50 characters."),
    slug: z
      .string()
      .regex(
        SLUG_REGEX,
        "Slug must be 3-50 chars, lowercase letters, numbers and hyphens only.",
      ),
    date_start: z.string(),
    date_end: z.string(),
  })
  .refine((data) => Boolean(data.date_start && data.date_end), {
    message: "Please select a start and end date.",
    path: ["date_start"],
  });

// ─── Helpers ───────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Component ─────────────────────────────────────────────────────────────

interface StepEventProps {
  defaultValues?: Partial<CreateEventData>;
  onNext: (data: CreateEventData) => void;
}

const StepEvent: FC<StepEventProps> = ({ defaultValues, onNext }) => {
  const { goTo } = useSteps<StepType>();
  const [attemptCount, setAttemptCount] = useState(0);
  const [eventName, setEventName] = useState(defaultValues?.event_name ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    return {
      from: defaultValues?.date_start
        ? new Date(defaultValues.date_start)
        : new Date(),
      to: defaultValues?.date_end
        ? addDays(new Date(new Date(defaultValues.date_end)), 3)
        : addDays(new Date(), 3),
    };
  });

  const {
    mutateAsync: checkSlug,
    reset: resetSlug,
    data: slugExists,
    isPending: isCheckingSlug,
    error,
  } = useCheckSlugMutation();

  const form = useForm({
    defaultValues: {
      display_name: defaultValues?.display_name ?? "",
      event_name: defaultValues?.event_name ?? "",
      slug: defaultValues?.slug ?? "",
      date_start: dateRange?.from?.toISOString().split("T")[0] ?? "",
      date_end: dateRange?.to?.toISOString().split("T")[0] ?? "",
    },
    validators: {
      onSubmit: stepEventSchema,
      onChange: stepEventSchema,
    },
    onSubmit: async ({ value }) => {
      const exists = await checkSlug(value.slug);
      if (exists) return;

      onNext({
        display_name: value.display_name.trim(),
        event_name: value.event_name.trim(),
        slug: value.slug,
        date_start: value.date_start,
        date_end: value.date_end,
      });

      goTo("Role");
    },
  });

  useEffect(() => {
    if (!slugTouched) {
      form.setFieldValue("slug", toSlug(defaultValues?.slug ?? eventName));
    }
  }, [defaultValues?.slug, eventName, slugTouched]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((prev) => prev + 1);
    form.handleSubmit();
  };

  const dateLabel =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "do MMM")} – ${format(dateRange.to, "do MMM yyyy")}`
      : "Pick dates";

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FieldGroup className="block space-y-4">
        {/* Display Name */}
        <form.Field name="display_name">
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
                  <FieldLabel htmlFor="displayName">Your Name</FieldLabel>
                  <FieldContent>
                    <Input
                      id="displayName"
                      placeholder="e.g. Danish Izhan"
                      autoFocus
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </FieldContent>
                </Field>
              </AnimateItem>
            );
          }}
        </form.Field>
        {/* Event Name */}
        <form.Field name="event_name">
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
                  <FieldLabel htmlFor="eventName">Event Name</FieldLabel>
                  <FieldContent>
                    <Input
                      id="eventName"
                      placeholder="e.g. Danish & Nadhirah Wedding"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        setEventName(e.target.value);
                      }}
                      onBlur={field.handleBlur}
                    />
                  </FieldContent>
                </Field>
              </AnimateItem>
            );
          }}
        </form.Field>

        {/* Date Range — lives outside tanstack form, uses its own error state */}
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
                  <FieldLabel className="flex justify-between">
                    <span>Event Dates</span>
                    {dateRange?.from && dateRange?.to && (
                      <span className="text-muted-foreground font-normal">
                        <span className="text-muted-foreground font-normal text-xs">
                          {(() => {
                            const days =
                              differenceInCalendarDays(
                                dateRange.to,
                                dateRange.from,
                              ) + 1;
                            const digits = days.toString().split("");

                            return (
                              <>
                                {digits.map((digit, index) => (
                                  <OdometerDigit
                                    key={index}
                                    className="inline-block"
                                    value={parseInt(digit)}
                                  />
                                ))}
                                {days > 1 ? " days" : " day"}
                              </>
                            );
                          })()}
                        </span>
                      </span>
                    )}
                  </FieldLabel>
                  <FieldContent>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 font-normal"
                        >
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span
                            className={
                              dateRange?.from ? "" : "text-muted-foreground"
                            }
                          >
                            {dateLabel}
                          </span>
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
                                ? range.from.toISOString().split("T")[0]
                                : "",
                            );
                            form.setFieldValue(
                              "date_end",
                              range?.to
                                ? range.to.toISOString().split("T")[0]
                                : "",
                            );
                          }}
                          numberOfMonths={1}
                        />
                      </PopoverContent>
                    </Popover>
                  </FieldContent>
                </Field>
              </AnimateItem>
            );
          }}
        </form.Field>
        {/* Slug */}
        <form.Field name="slug">
          {(field) => {
            const hasError =
              (Boolean(field.state.meta.errors.length) && attemptCount > 0) ||
              slugExists == true;

            return (
              <AnimateItem
                errors={
                  slugExists
                    ? [{ message: "Slug taken, please choose another." }]
                    : field.state.meta.errors
                }
                hasError={hasError}
                attemptCount={attemptCount}
              >
                <Field data-invalid={hasError} className="gap-2">
                  <FieldLabel htmlFor="slug">URL Slug</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        id="slug"
                        placeholder="e.g. my-wedding"
                        value={field.state.value}
                        className="pr-16!"
                        onChange={(e) => {
                          setSlugTouched(Boolean(e.target.value));
                          field.handleChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          resetSlug();
                          field.handleBlur();
                          field.handleChange(toSlug(e.target.value));
                        }}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          type="button"
                          variant="outline"
                          onClick={() => checkSlug(field.state.value)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {isCheckingSlug ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

                    <div className="text-black mt-4 p-4 rounded-xl border border-secondary/30 bg-secondary/30">
                      <h4 className="text-2xs uppercase tracking-widest font-semibold mb-3">
                        Your Wedding Links
                      </h4>

                      <div className="space-y-3">
                        {/* Admin Link */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                          <span className="text-sm font-serif italic min-w-[40px]">
                            Admin:
                          </span>
                          <code className="text-xs bg-secondary/60 px-2 py-1 rounded border border-secondary/60 w-full truncate">
                            {`hitchystitchy.com/${field.state.value ? toSlug(field.state.value) : "my-wedding"}/admin`}
                          </code>
                        </div>

                        {/* RSVP */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                          <span className="text-sm font-serif italic min-w-[40px]">
                            RSVP:
                          </span>
                          <code className="text-xs bg-secondary/60 px-2 py-1 rounded border border-secondary/60 w-full truncate">
                            {`hitchystitchy.com/${field.state.value ? toSlug(field.state.value) : "my-wedding"}`}
                          </code>
                        </div>
                      </div>
                    </div>
                  </FieldContent>
                </Field>
              </AnimateItem>
            );
          }}
        </form.Field>

        {/* Mutation error */}
        <AnimateItem
          hasError={Boolean(error)}
          error={error ?? undefined}
          attemptCount={attemptCount}
        />
      </FieldGroup>

      <form.Subscribe selector={(s) => [s.isSubmitting, s.isSubmitSuccessful]}>
        {([isSubmitting]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isCheckingSlug}
          >
            Next
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

export default StepEvent;
