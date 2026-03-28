import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { fadeUp } from "@/pages/admin/animations";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useSettings, useEventSettingsMutation } from "../queries";
import type { EventSettings } from "../types";

const DEFAULTS: EventSettings = {
  eventName: "Dan & Nad Wedding",
  numberOfDays: 2,
  day1Date: "2025-07-04",
  day2Date: "2025-07-05",
  day1Venue: "",
  day2Venue: "",
  rsvpDeadlineEnabled: false,
  rsvpDeadline: "",
};

export function EventSettingsSection() {
  const { data: settings } = useSettings();
  const [form, setForm] = useState<EventSettings>(DEFAULTS);
  const { setEventDays } = useAdminStore();

  useEffect(() => {
    if (settings?.event) setForm(settings.event);
  }, [settings]);

  const { mutate: save, isPending } = useEventSettingsMutation();

  const set = <K extends keyof EventSettings>(key: K, value: EventSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <motion.div initial="hidden" animate="show" variants={fadeUp(0)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-serif">Event Settings</CardTitle>
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
              value={form.eventName}
              onChange={(e) => set("eventName", e.target.value)}
              placeholder="Dan & Nad Wedding"
            />
          </div>

          {/* Number of days */}
          <div className="space-y-2">
            <Label htmlFor="numDays">Number of days</Label>
            <Select
              value={String(form.numberOfDays)}
              onValueChange={(v) => {
                const days = Number(v) as 1 | 2;
                set("numberOfDays", days);
                setEventDays(days);
              }}
            >
              <SelectTrigger id="numDays" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="2">2 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Day 1 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Day 1</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day1Date">Date</Label>
                <Input
                  id="day1Date"
                  type="date"
                  value={form.day1Date}
                  onChange={(e) => set("day1Date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="day1Venue">
                  <MapPin className="inline h-3 w-3 mr-1" />
                  Venue
                </Label>
                <Input
                  id="day1Venue"
                  value={form.day1Venue}
                  onChange={(e) => set("day1Venue", e.target.value)}
                  placeholder="Venue name"
                />
              </div>
            </div>
          </div>

          {/* Day 2 — only when numberOfDays = 2 */}
          {form.numberOfDays === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Day 2</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day2Date">Date</Label>
                  <Input
                    id="day2Date"
                    type="date"
                    value={form.day2Date}
                    onChange={(e) => set("day2Date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day2Venue">
                    <MapPin className="inline h-3 w-3 mr-1" />
                    Venue
                  </Label>
                  <Input
                    id="day2Venue"
                    value={form.day2Venue}
                    onChange={(e) => set("day2Venue", e.target.value)}
                    placeholder="Venue name"
                  />
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* RSVP deadline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="rsvpDeadlineToggle" className="text-sm font-medium">
                  RSVP deadline
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Show a deadline date on the invitation page.
                </p>
              </div>
              <Switch
                id="rsvpDeadlineToggle"
                checked={form.rsvpDeadlineEnabled}
                onCheckedChange={(v) => set("rsvpDeadlineEnabled", v)}
              />
            </div>
            {form.rsvpDeadlineEnabled && (
              <div className="space-y-2">
                <Label htmlFor="rsvpDeadline">Deadline date</Label>
                <Input
                  id="rsvpDeadline"
                  type="date"
                  value={form.rsvpDeadline}
                  onChange={(e) => set("rsvpDeadline", e.target.value)}
                  className="w-48"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => save(form)}
              disabled={isPending}
              size="sm"
            >
              {isPending ? "Saving…" : "Save event settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
