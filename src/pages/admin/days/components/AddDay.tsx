import { useRef, useState, type FC } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import SubmitButton from "@/components/custom/form/SubmitButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useAdminStore } from "../../store/useAdminStore";
import { useLimitGuard } from "../../plan/hooks/useLimitGuard";
import { useDayMutations } from "../queries";

const AddDay: FC = () => {
  const { eventId } = useAdminStore();
  const { create } = useDayMutations();
  const guardAdd = useLimitGuard();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [label, setLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setDate(undefined);
    setLabel("");
  };

  const canSubmit = !!date && !!label.trim();

  const submit = () => {
    if (!canSubmit || !date) return;
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
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        // At the day cap → upsell instead of opening the form (server still gates).
        if (o && guardAdd("days")) return;
        setOpen(o);
        if (!o) reset();
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" size="sm" className="gap-1.5">
          <Plus className="size-4" /> a day
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto space-y-3 bg-card p-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d);
            // Defer a frame so it wins over react-day-picker's own focus move.
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="p-0 bg-card w-full"
        />
        <Input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Label (e.g. Walimah)"
          maxLength={60}
        />
        <SubmitButton
          type="button"
          size="sm"
          className="w-full"
          disabled={!canSubmit}
          isPending={create.isPending}
          isSuccess={create.isSuccess}
          isError={create.isError}
          onClick={submit}
        >
          Add day
        </SubmitButton>
      </PopoverContent>
    </Popover>
  );
};

export default AddDay;
