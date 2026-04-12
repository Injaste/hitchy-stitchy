import { useMemo, useState, type FC } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { generateEventDays } from "../utils";

import { timelineItemFormSchema, type TimelineItemFormValues } from "../types";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

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
  const { dateStart, dateEnd } = useAdminStore();
  const [day, setDay] = useState(defaultValues?.day ?? "");

  const eventDays = useMemo(() => {
    if (!dateStart || !dateEnd) return [];
    return generateEventDays(dateStart, dateEnd);
  }, [dateStart, dateEnd]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      day,
      label: (fd.get("label") as string) ?? "",
      timeStart: (fd.get("timeStart") as string) ?? "",
      timeEnd: (fd.get("timeEnd") as string) ?? "",
      title: (fd.get("title") as string) ?? "",
      description: (fd.get("description") as string) ?? "",
      notes: (fd.get("notes") as string) ?? "",
      assignees: [] as string[],
    };
    const result = timelineItemFormSchema.safeParse(raw);
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? "Invalid input";
      toast.error(msg);
      return;
    }
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            name="label"
            defaultValue={defaultValues?.label ?? ""}
            placeholder="e.g. Nikah, Sanding"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Day</Label>
          <Select value={day} onValueChange={setDay} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              {eventDays.map((d) => {
                const val = format(d, "yyyy-MM-dd");
                return (
                  <SelectItem key={val} value={val}>
                    <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                    {format(d, "d MMM yyyy (EEE)")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Start time</Label>
            <InputGroup>
              <InputGroupAddon>
                <Clock className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                name="timeStart"
                type="time"
                defaultValue={defaultValues?.timeStart ?? ""}
                required
                className="[&::-webkit-calendar-picker-indicator]:hidden"
              />
            </InputGroup>
          </div>
          <div className="space-y-1.5">
            <Label>
              End time{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <Clock className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                name="timeEnd"
                type="time"
                defaultValue={defaultValues?.timeEnd ?? ""}
                className="[&::-webkit-calendar-picker-indicator]:hidden"
              />
            </InputGroup>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>
            Description{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Textarea
            name="description"
            defaultValue={defaultValues?.description ?? ""}
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label>
            Notes{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Textarea
            name="notes"
            defaultValue={defaultValues?.notes ?? ""}
            rows={2}
          />
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-2 pt-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default TimelineItemForm;
