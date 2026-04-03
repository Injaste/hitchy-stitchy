import { useState } from "react";
import { format, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fadeUp } from "@/pages/admin/animations";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { toast } from "sonner";
import type { EventConfig, EventDay } from "../types";

function deriveDays(
  range: { from: Date; to: Date },
  prevDays: EventDay[],
): EventDay[] {
  const dates = eachDayOfInterval({ start: range.from, end: range.to });
  return dates.map((date, index) => {
    const prev = prevDays[index];
    return {
      id: `day-${index + 1}`,
      date,
      label: prev?.label ?? `Day ${index + 1}`,
      venue: prev?.venue ?? "",
    };
  });
}

export function EventSettingsSection() {
  const { eventConfig, setEventConfig } = useAdminStore();

  const [name, setName] = useState(eventConfig.name);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: eventConfig.dateRange.from,
    to: eventConfig.dateRange.to,
  });
  const [days, setDays] = useState<EventDay[]>(eventConfig.days);
  const [rsvpDeadlineEnabled, setRsvpDeadlineEnabled] = useState(
    eventConfig.rsvpDeadlineEnabled,
  );
  const [rsvpDeadline, setRsvpDeadline] = useState<Date | undefined>(
    eventConfig.rsvpDeadline ?? undefined,
  );
  const [rsvpMode, setRsvpMode] = useState(eventConfig.rsvpForm.mode);

  const handleRangeChange = (range: DateRange | undefined) => {
    if (!range?.from) return;
    const newRange = { from: range.from, to: range.to ?? range.from };
    setDateRange(newRange);
    const newDays = deriveDays(newRange, days);
    setDays(newDays);
  };

  const updateDayLabel = (index: number, label: string) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, label } : d)));
  };

  const updateDayVenue = (index: number, venue: string) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, venue } : d)));
  };

  const handleSave = () => {
    if (!dateRange.from) return;
    const updated: EventConfig = {
      ...eventConfig,
      name,
      dateRange: { from: dateRange.from, to: dateRange.to ?? dateRange.from },
      days,
      rsvpDeadlineEnabled,
      rsvpDeadline: rsvpDeadlineEnabled ? (rsvpDeadline ?? null) : null,
      rsvpForm: { ...eventConfig.rsvpForm, mode: rsvpMode },
    };
    setEventConfig(updated);
    toast.success("Event settings saved");
  };

  const formatRange = () => {
    if (!dateRange.from) return "Pick a date range";
    if (!dateRange.to || dateRange.from.getTime() === dateRange.to.getTime()) {
      return format(dateRange.from, "do MMM yyyy");
    }
    return `${format(dateRange.from, "do MMM")} – ${format(dateRange.to, "do MMM yyyy")}`;
  };

  return (
    <motion.div initial="hidden" animate="show" variants={fadeUp(0)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-serif">
              Event Settings
            </CardTitle>
          </div>
          <CardDescription>
            Configure your event name, dates, venues, and RSVP deadline.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event name */}
          <div className="space-y-2">
            <Label htmlFor="eventName">Event name</Label>
            <Input
              id="eventName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dan & Nad Wedding"
            />
          </div>

          <Separator />

          {/* Date range picker */}
          <div className="space-y-2">
            <Label>Event dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 font-normal"
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{formatRange()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Per-day config */}
          {days.length > 0 && (
            <div className="space-y-4">
              {days.map((day, index) => (
                <div
                  key={day.id}
                  className="space-y-3 p-4 rounded-lg border border-border bg-muted/20"
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    Day {index + 1} — {format(day.date, "EEEE, do MMMM")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`day-label-${index}`}>Label</Label>
                      <Input
                        id={`day-label-${index}`}
                        value={day.label}
                        onChange={(e) => updateDayLabel(index, e.target.value)}
                        placeholder="e.g. The Ceremony"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`day-venue-${index}`}>
                        <MapPin className="inline h-3 w-3 mr-1" />
                        Venue
                      </Label>
                      <Input
                        id={`day-venue-${index}`}
                        value={day.venue}
                        onChange={(e) => updateDayVenue(index, e.target.value)}
                        placeholder="e.g. De Hall Pte Ltd"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* RSVP deadline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">RSVP deadline</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Show a deadline date on the invitation page.
                </p>
              </div>
              <Switch
                checked={rsvpDeadlineEnabled}
                onCheckedChange={setRsvpDeadlineEnabled}
              />
            </div>
            {rsvpDeadlineEnabled && (
              <div className="space-y-2">
                <Label>Deadline date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-48 justify-start gap-2 font-normal"
                    >
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {rsvpDeadline
                          ? format(rsvpDeadline, "do MMM yyyy")
                          : "Pick a date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={rsvpDeadline}
                      onSelect={setRsvpDeadline}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <Separator />

          {/* RSVP mode */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">RSVP mode</h4>
            <RadioGroup
              value={rsvpMode}
              onValueChange={(v) =>
                setRsvpMode(v as EventConfig["rsvpForm"]["mode"])
              }
              className="space-y-2"
            >
              {[
                {
                  value: "open",
                  label: "Open",
                  description: "Anyone can RSVP",
                },
                {
                  value: "pool",
                  label: "Pool",
                  description: "Pre-approved guests only",
                },
                {
                  value: "pool-open",
                  label: "Pool Open",
                  description: "Pool gets priority, overflow allowed",
                },
              ].map((opt) => (
                <Label
                  key={opt.value}
                  htmlFor={`rsvp-mode-${opt.value}`}
                  className="flex items-start gap-3 rounded-lg border border-border px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                >
                  <RadioGroupItem
                    value={opt.value}
                    id={`rsvp-mode-${opt.value}`}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {opt.description}
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} size="sm">
              Save event settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
