import { useState, type FC } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import type { TimelineItemFormValues } from "../types";

interface TimelineItemFormProps {
  defaultValues?: Partial<TimelineItemFormValues>;
  onSubmit: (values: TimelineItemFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

const TimelineItemForm: FC<TimelineItemFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}) => {
  const [day, setDay] = useState<Date | undefined>(() => {
    if (!defaultValues?.day) return undefined;
    const [y, m, d] = defaultValues.day.split("-").map(Number);
    return new Date(y, m - 1, d);
  });
  const [calOpen, setCalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!day) return;
    const fd = new FormData(e.currentTarget);
    onSubmit({
      day: format(day, "yyyy-MM-dd"),
      label: (fd.get("label") as string) ?? "",
      timeStart: (fd.get("timeStart") as string) ?? "",
      timeEnd: (fd.get("timeEnd") as string) ?? "",
      title: (fd.get("title") as string) ?? "",
      description: (fd.get("description") as string) ?? "",
      notes: (fd.get("notes") as string) ?? "",
      assignees: [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      {/* When */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Day</Label>
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start font-normal",
                  !day && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {day ? format(day, "d MMM yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={day}
                onSelect={(d) => {
                  setDay(d);
                  setCalOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Start time</Label>
            <input
              name="timeStart"
              type="time"
              defaultValue={defaultValues?.timeStart ?? ""}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              End time{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <input
              name="timeEnd"
              type="time"
              defaultValue={defaultValues?.timeEnd ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input
            name="title"
            defaultValue={defaultValues?.title ?? ""}
            placeholder="e.g. Bridal prep"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>
            Label{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            name="label"
            defaultValue={defaultValues?.label ?? ""}
            placeholder="e.g. Nikah, Sanding"
          />
        </div>

        <div className="space-y-1.5">
          <Label>
            Description{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            name="description"
            defaultValue={defaultValues?.description ?? ""}
            rows={2}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label>
          Notes{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default TimelineItemForm;
