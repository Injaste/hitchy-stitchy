import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface EventData {
  eventName: string;
  dateStart: string;
  dateEnd: string;
  slug: string;
}

interface Props {
  defaultValues?: Partial<EventData>;
  onNext: (data: EventData) => void;
  onBack: () => void;
}

interface FieldErrors {
  eventName?: string;
  dates?: string;
  slug?: string;
}

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function StepEvent({ defaultValues, onNext, onBack }: Props) {
  const [eventName, setEventName] = useState(defaultValues?.eventName ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (defaultValues?.dateStart && defaultValues?.dateEnd) {
      return {
        from: new Date(defaultValues.dateStart),
        to: new Date(defaultValues.dateEnd),
      };
    }
    return undefined;
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!slugTouched) {
      setSlug(toSlug(eventName));
    }
  }, [eventName, slugTouched]);

  const handleSlugChange = (val: string) => {
    setSlugTouched(true);
    setSlug(val);
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (eventName.trim().length < 3) next.eventName = "Event name must be at least 3 characters.";
    if (!dateRange?.from || !dateRange?.to) next.dates = "Please select a start and end date.";
    if (!SLUG_REGEX.test(slug)) next.slug = "Slug must be 3–50 chars, lowercase letters, numbers and hyphens only.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    onNext({
      eventName: eventName.trim(),
      dateStart: format(dateRange!.from!, "yyyy-MM-dd"),
      dateEnd: format(dateRange!.to!, "yyyy-MM-dd"),
      slug,
    });
  };

  const dateLabel = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, "do MMM")} – ${format(dateRange.to, "do MMM yyyy")}`
    : "Pick dates";

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="eventName">Event Name</Label>
        <Input
          id="eventName"
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="e.g. Danish & Nadhirah Wedding"
          autoFocus
        />
        {errors.eventName && <p className="text-xs text-destructive">{errors.eventName}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Event Dates</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 font-normal"
            >
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className={dateRange?.from ? "" : "text-muted-foreground"}>
                {dateLabel}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
        {errors.dates && <p className="text-xs text-destructive">{errors.dates}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">URL Slug</Label>
        <Input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="e.g. danish-nadhirah-2026"
        />
        {slug && !errors.slug && (
          <p className="text-xs text-muted-foreground font-mono">
            weddings.cozynosy.com/{slug}/admin
          </p>
        )}
        {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onBack} className="w-full">
          Back
        </Button>
        <Button onClick={handleNext} className="w-full">
          Next
        </Button>
      </div>
    </div>
  );
}
