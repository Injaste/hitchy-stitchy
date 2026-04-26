import { useState, useEffect } from "react";
import type { FC } from "react";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import OdometerDigit from "@/components/animations/animate-odometer-digit";
import { useSteps } from "@/components/custom/steps-direction";

import type { CreateEventData, StepType } from "../types";
import type { DateRange } from "react-day-picker";
import {
  useSlugCheck,
  toSafeSlug,
  toSlug,
  type SlugStatus,
} from "../hooks/useSlugCheck";
import { formatDateRange } from "@/lib/utils/utils-time";
import ArraySeparator from "@/components/custom/array-separator";

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;
const BASE_URL = import.meta.env.VITE_BASE_URL;

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
        "Slug must be 3–50 chars, lowercase letters, numbers and hyphens only.",
      ),
    date_start: z.string(),
    date_end: z.string(),
  })
  .refine((data) => Boolean(data.date_start && data.date_end), {
    message: "Please select your event dates.",
    path: ["date_start"],
  });

function SlugStatusIcon({ status }: { status: SlugStatus }) {
  if (status === "checking")
    return <Loader2 className="size-4.5 animate-spin text-muted-foreground" />;
  if (status === "available")
    return <CheckCircle2 className="size-4.5 text-primary" />;
  if (status === "taken")
    return <XCircle className="size-4.5 text-destructive" />;
  if (status === "error")
    return <AlertCircle className="size-4.5 text-muted-foreground" />;
  return null;
}

interface StepEventProps {
  defaultValues?: Partial<CreateEventData>;
  onNext: (data: CreateEventData) => void;
}

const StepEvent: FC<StepEventProps> = ({ defaultValues, onNext }) => {
  const { goTo } = useSteps<StepType>();
  const [attemptCount, setAttemptCount] = useState(0);
  const [eventName, setEventName] = useState(defaultValues?.event_name ?? "");
  const [slugTouched, setSlugTouched] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultValues?.date_start
      ? {
          from: new Date(defaultValues.date_start),
          to: defaultValues.date_end
            ? new Date(defaultValues.date_end)
            : undefined,
        }
      : {
          from: new Date(),
          to: addDays(new Date(), 5),
        },
  );

  const isMobile = useIsMobile();
  const { status: slugStatus, scheduleCheck, checkNow } = useSlugCheck();

  const form = useForm({
    defaultValues: {
      display_name: defaultValues?.display_name ?? "",
      event_name: defaultValues?.event_name ?? "",
      slug: defaultValues?.slug ?? "",
      date_start: defaultValues?.date_start ?? dateRange?.from?.toString()!,
      date_end: defaultValues?.date_end ?? dateRange?.to?.toString()!,
    },
    validators: {
      onSubmit: stepEventSchema,
      onChange: stepEventSchema,
    },
    onSubmit: async ({ value }) => {
      const taken = await checkNow(value.slug);
      if (taken) return;

      onNext({
        display_name: value.display_name.trim(),
        event_name: value.event_name.trim(),
        slug: value.slug,
        date_start: format(value.date_start, "yyyy-MM-dd"),
        date_end: format(value.date_end, "yyyy-MM-dd"),
      });

      goTo("Role");
    },
  });

  useEffect(() => {
    if (slugTouched) return;
    const generated = toSlug(defaultValues?.slug ?? eventName);
    form.setFieldValue("slug", generated);
    scheduleCheck(generated);
  }, [eventName, slugTouched]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAttemptCount((prev) => prev + 1);
    form.handleSubmit();
  };

  const dateLabel =
    dateRange?.from && dateRange?.to
      ? formatDateRange(
          dateRange.from.toISOString(),
          dateRange.to.toISOString(),
        )
      : "Pick your event dates";

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <FieldGroup className="block space-y-6">
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
                  <FieldLabel
                    htmlFor="displayName"
                    className="flex justify-between"
                  >
                    Your Name
                    <span className="text-xs text-muted-foreground font-normal">
                      — how you appear to your team
                    </span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="displayName"
                      placeholder="e.g. Danish"
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
                  <FieldLabel htmlFor="event_name">Event Name</FieldLabel>
                  <FieldContent>
                    <Input
                      id="event_name"
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
                      <span className="text-xs text-muted-foreground font-normal">
                        {(() => {
                          const days =
                            differenceInCalendarDays(
                              dateRange.to,
                              dateRange.from,
                            ) + 1;
                          const digits = days.toString().split("");
                          return (
                            <>
                              {"— "}
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
                          <ArraySeparator
                            items={[...dateLabel]}
                            separator="-"
                            className="text-sm"
                          />
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
                              range?.to ? format(range.to, "yyyy-MM-dd") : "",
                            );
                          }}
                          numberOfMonths={isMobile ? 1 : 2}
                          disabled={{ before: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FieldContent>
                </Field>
              </AnimateItem>
            );
          }}
        </form.Field>

        <form.Field name="slug">
          {(field) => {
            const hasError =
              (Boolean(field.state.meta.errors.length) && attemptCount > 0) ||
              slugStatus === "taken";

            return (
              <AnimateItem
                errors={
                  slugStatus === "taken"
                    ? [
                        {
                          message:
                            "This slug is already taken. Please choose another.",
                        },
                      ]
                    : field.state.meta.errors
                }
                hasError={hasError}
                attemptCount={attemptCount}
              >
                <Field data-invalid={hasError} className="gap-2">
                  <FieldLabel htmlFor="slug">Event URL</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        id="slug"
                        placeholder="e.g. my-wedding"
                        value={field.state.value}
                        onChange={(e) => {
                          const safe = toSafeSlug(e.target.value);
                          setSlugTouched(Boolean(safe));
                          field.handleChange(safe);
                          scheduleCheck(safe);
                        }}
                        onBlur={(e) => {
                          field.handleBlur();
                          const normalized = toSlug(e.target.value);
                          if (normalized !== field.state.value) {
                            field.handleChange(normalized);
                            scheduleCheck(normalized);
                          }
                        }}
                      />
                      {/* Live status icon — replaces the manual "Verify" button */}
                      <InputGroupAddon align="inline-end">
                        <SlugStatusIcon status={slugStatus} />
                      </InputGroupAddon>
                    </InputGroup>

                    {/* URL preview */}
                    <div className="text-foreground mt-4 p-4 rounded-md border border-secondary/30 bg-secondary/30">
                      <h4 className="text-2xs uppercase tracking-widest font-semibold mb-3">
                        Your Unique Wedding Links
                      </h4>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                          <span className="text-sm italic min-w-[40px]">
                            Admin:
                          </span>
                          <code className="text-xs bg-secondary/60 px-2 py-1 rounded-sm border border-secondary/60 w-full truncate">
                            {`${BASE_URL}/${field.state.value || "my-wedding"}/admin`}
                          </code>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                          <span className="text-sm italic min-w-[40px]">
                            RSVP:
                          </span>
                          <code className="text-xs bg-secondary/60 px-2 py-1 rounded-sm border border-secondary/60 w-full truncate">
                            {`${BASE_URL}/${field.state.value || "my-wedding"}`}
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
      </FieldGroup>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying…
              </>
            ) : (
              "Continue"
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

export default StepEvent;
