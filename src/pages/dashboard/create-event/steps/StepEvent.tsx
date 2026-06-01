import { useState, useEffect, useRef } from "react";
import type { FC } from "react";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
import { useIsMobile } from "@/hooks/use-mobile";

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
  TextField,
  FieldShell,
  SubmitButton,
} from "@/components/custom/form";
import Odometer from "@/components/animations/animate-odometer";
import { useSteps } from "@/components/custom/steps-direction";
import { toSlug } from "@/hooks/useSlugCheck";
import { formatDateRange } from "@/lib/utils/utils-time";
import ArraySeparator from "@/components/custom/array-separator";

import {
  stepEventSchema,
  type StepEventFormValues,
  type CreateEventData,
  type StepType,
} from "../../types";
import type { DateRange } from "react-day-picker";
import SlugInput, { type SlugInputHandle } from "../SlugInput";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ─── Form hook ────────────────────────────────────────────────────────────────

interface UseStepEventFormOpts {
  defaultValues?: Partial<StepEventFormValues>;
  onSubmit: (values: StepEventFormValues) => Promise<void>;
}

export const useStepEventForm = ({
  defaultValues,
  onSubmit,
}: UseStepEventFormOpts) =>
  useForm({
    defaultValues: {
      display_name: defaultValues?.display_name ?? "",
      event_name: defaultValues?.event_name ?? "",
      slug: defaultValues?.slug ?? "",
      date_start: defaultValues?.date_start ?? "",
      date_end: defaultValues?.date_end ?? "",
    },
    validators: {
      onSubmit: stepEventSchema,
      onChange: stepEventSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

interface StepEventProps {
  defaultValues?: Partial<CreateEventData>;
  onNext: (data: CreateEventData) => void;
}

const StepEvent: FC<StepEventProps> = ({ defaultValues, onNext }) => {
  const { goTo } = useSteps<StepType>();
  const [eventName, setEventName] = useState(defaultValues?.event_name ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugIsTaken, setSlugIsTaken] = useState(false);
  const slugRef = useRef<SlugInputHandle>(null);

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

  const form = useStepEventForm({
    defaultValues: {
      display_name: defaultValues?.display_name,
      event_name: defaultValues?.event_name,
      slug: defaultValues?.slug,
      date_start: defaultValues?.date_start ?? dateRange?.from?.toString(),
      date_end: defaultValues?.date_end ?? dateRange?.to?.toString(),
    },
    onSubmit: async (value) => {
      const taken = await slugRef.current?.checkNow(value.slug);
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

  const slugValue = useStore(form.store, (s) => s.values.slug);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  useEffect(() => {
    if (slugTouched) return;
    const generated = toSlug(defaultValues?.slug ?? eventName);
    form.setFieldValue("slug", generated);
    slugRef.current?.scheduleCheck(generated);
  }, [eventName, slugTouched]);

  const dateLabel =
    dateRange?.from && dateRange?.to
      ? formatDateRange(
          dateRange.from.toISOString(),
          dateRange.to.toISOString(),
        )
      : "Pick your event dates";

  return (
    <FormShell form={form} className="space-y-6">
      <FieldGroup>
        <TextField
          name="display_name"
          labelClassName="flex justify-between w-full"
          label={
            <>
              Your Name
              <span className="text-xs text-muted-foreground font-normal">
                — how you appear to your team
              </span>
            </>
          }
          placeholder="e.g. Danish"
        />

        <TextField
          name="event_name"
          label="Event Name"
          placeholder="e.g. Danish & Nadhirah Wedding"
          onValueChange={setEventName}
        />

        <FieldShell
          name="date_start"
          labelClassName="flex justify-between w-full"
          label={
            <>
              <span>Event Dates</span>
              {dateRange?.from && dateRange?.to && (
                <span className="text-xs text-muted-foreground font-normal">
                  {(() => {
                    const days =
                      differenceInCalendarDays(dateRange.to, dateRange.from) +
                      1;
                    return (
                      <>
                        {"— "}
                        <Odometer value={days} />
                        {days > 1 ? " days" : " day"}
                      </>
                    );
                  })()}
                </span>
              )}
            </>
          }
        >
          {() => (
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
                      range?.from ? format(range.from, "yyyy-MM-dd") : "",
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
          )}
        </FieldShell>

        <FieldShell name="slug" label="Event URL">
          {(field, hasError) => (
            <SlugInput
              ref={slugRef}
              id="slug"
              value={field.state.value}
              invalid={hasError || slugIsTaken}
              onChange={(safe) => {
                setSlugTouched(true);
                field.handleChange(safe);
              }}
              onBlur={(currentValue) => {
                field.handleBlur();
                if (!currentValue) {
                  const generated = toSlug(eventName);
                  if (generated) {
                    form.setFieldValue("slug", generated);
                    slugRef.current?.scheduleCheck(generated);
                  }
                }
              }}
              onTakenChange={setSlugIsTaken}
            />
          )}
        </FieldShell>

        <div className="text-foreground p-4 rounded-md border border-secondary/30 bg-secondary/30">
          <h4 className="text-2xs uppercase tracking-widest font-semibold mb-3">
            Your Unique Wedding Links
          </h4>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-sm italic min-w-[40px]">Admin:</span>
              <code className="text-xs bg-secondary/60 px-2 py-1 rounded-sm border border-secondary/60 w-full truncate">
                {`${BASE_URL}/${slugValue || "my-wedding"}/admin`}
              </code>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-sm italic min-w-[40px]">RSVP:</span>
              <code className="text-xs bg-secondary/60 px-2 py-1 rounded-sm border border-secondary/60 w-full truncate">
                {`${BASE_URL}/${slugValue || "my-wedding"}`}
              </code>
            </div>
          </div>
        </div>
      </FieldGroup>

      <SubmitButton size="lg" isPending={isSubmitting} className="w-full">
        Continue
      </SubmitButton>
    </FormShell>
  );
};

export default StepEvent;
