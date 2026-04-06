import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

import { useStartCueMutation } from "../queries";
import { useCueStore } from "../../store/useCueStore";
import type { TimelineEvent } from "../types";

interface ConfirmUpdateActiveCueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: TimelineEvent | null;
}

export function ConfirmUpdateActiveCueModal({
  open,
  onOpenChange,
  event,
}: ConfirmUpdateActiveCueModalProps) {
  const { activeCue, setActiveCue } = useCueStore();
  const { mutate: startCue, isPending } = useStartCueMutation();

  const handleConfirm = () => {
    if (!event) return;
    startCue(event.id);
    setActiveCue({
      id: event.id,
      title: event.title,
      timeStart: event.timeStart,
      dayId: event.dayId,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Replace Active Cue
          </DialogTitle>
          <DialogDescription>
            "{activeCue?.title}" is currently active. Replace it with "
            {event?.title}"?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            Replace Cue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
