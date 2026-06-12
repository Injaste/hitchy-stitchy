import { useState, type FC } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useAdminStore } from "../../store/useAdminStore";
import { useDayMutations } from "../queries";

const AddDay: FC = () => {
  const { eventId } = useAdminStore();
  const { create } = useDayMutations();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [label, setLabel] = useState("");

  const reset = () => {
    setDate(undefined);
    setLabel("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Plus className="size-4" /> Add a day
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto space-y-3 bg-card p-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="p-0 bg-card w-full"
        />
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Walimah)"
          maxLength={60}
        />
        <Button
          type="button"
          size="sm"
          className="w-full"
          disabled={!date || !label.trim() || create.isPending}
          onClick={() =>
            date &&
            create.mutate(
              {
                event_id: eventId!,
                date: format(date, "yyyy-MM-dd"),
                label: label.trim(),
              },
              {
                onSuccess: () => {
                  setOpen(false);
                  reset();
                },
              },
            )
          }
        >
          Add day
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default AddDay;
