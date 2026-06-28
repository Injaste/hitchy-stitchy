import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, CalendarClock, EyeOff, CalendarX, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import { combineDeadline } from "../utils";

interface PublishButtonProps {
  canPublish: boolean;
  busy: boolean;
  isLive: boolean;
  isScheduled: boolean;
  isPublished: boolean;
  publishPending: boolean;
  publishSuccess: boolean;
  publishError: boolean;
  // Immediate publish (opens the confirm dialog).
  onPublish: () => void;
  // Schedule for a future timestamp. Returns false when the form is invalid
  // (the caller jumps to the errored tab); the popover closes in that case.
  onSchedule: (publishAt: string) => boolean;
}

// Split button: "Publish" (immediate, unchanged) + a chevron whose popover is a
// 2-step menu — pick "Schedule publish" to reveal a date/time picker, or
// "Unpublish"/"Cancel" (moved here from the overflow menu). Scheduling reuses the
// same publish RPC with a future published_at — no separate backend path.
const PublishButton = ({
  canPublish,
  busy,
  isLive,
  isScheduled,
  isPublished,
  publishPending,
  publishSuccess,
  publishError,
  onPublish,
  onSchedule,
}: PublishButtonProps) => {
  const openConfirm = useInvitationModalStore((s) => s.openConfirm);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"menu" | "schedule">("menu");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("09:00");

  // Reset to the menu step + clear the picked date whenever the popover closes.
  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setStep("menu");
      setDate(undefined);
    }
  };

  // Close the popover once a scheduled publish lands.
  useCloseOnSuccess(open && publishSuccess, () => onOpenChange(false));

  // Compare the chosen local date+time to now to block past schedules.
  const localTarget =
    date && time ? new Date(`${format(date, "yyyy-MM-dd")}T${time}`) : null;
  const isFuture = !!localTarget && localTarget.getTime() > Date.now();

  const schedule = () => {
    if (!date || !isFuture) return;
    const publishAt = combineDeadline(format(date, "yyyy-MM-dd"), time);
    if (!publishAt) return;
    // If the form is invalid the caller jumps tabs and returns false — close
    // the popover so the errored field is visible.
    if (!onSchedule(publishAt)) onOpenChange(false);
  };

  const unpublish = () => {
    onOpenChange(false);
    openConfirm("unpublish");
  };

  return (
    <div className="flex items-center">
      <Button
        type="button"
        size="sm"
        onClick={onPublish}
        disabled={!canPublish || busy}
        className="rounded-r-none"
      >
        Publish
      </Button>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            disabled={busy}
            aria-label="More publish options"
            className="rounded-l-none border-l-primary-foreground/30 px-1.5"
          >
            <ChevronDown className="size-4" />
          </Button>
        </PopoverTrigger>

        {step === "menu" ? (
          <PopoverContent align="end" className="w-52 bg-card p-1.5">
            {!isLive && (
              <button
                type="button"
                onClick={() => setStep("schedule")}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                <CalendarClock className="size-4 text-muted-foreground" />
                {isScheduled ? "Reschedule" : "Schedule publish"}
              </button>
            )}
            {isPublished && (
              <button
                type="button"
                onClick={unpublish}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                {isScheduled ? (
                  <>
                    <CalendarX className="size-4 text-muted-foreground" />
                    Cancel scheduled publish
                  </>
                ) : (
                  <>
                    <EyeOff className="size-4 text-muted-foreground" />
                    Unpublish
                  </>
                )}
              </button>
            )}
          </PopoverContent>
        ) : (
          <PopoverContent align="end" className="w-auto space-y-3 bg-card p-3">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setStep("menu")}
                aria-label="Back"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm font-medium">Schedule publish</span>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={{ before: new Date() }}
              className="p-0 bg-card w-full"
            />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            {date && !isFuture && (
              <p className="text-xs text-destructive">
                Pick a date and time in the future.
              </p>
            )}
            <SubmitButton
              type="button"
              size="sm"
              className="w-full"
              onClick={schedule}
              disabled={!date || !isFuture}
              isPending={publishPending}
              isSuccess={publishSuccess}
              isError={publishError}
            >
              {localTarget && isFuture
                ? `Schedule for ${format(localTarget, "d MMM, h:mm a")}`
                : "Schedule publish"}
            </SubmitButton>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
};

export default PublishButton;
