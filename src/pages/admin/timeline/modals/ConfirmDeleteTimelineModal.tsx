import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useDeleteTimelineMutation } from "../queries";
import type { TimelineEvent } from "../types";

interface ConfirmDeleteTimelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: TimelineEvent | null;
}

export function ConfirmDeleteTimelineModal({
  open,
  onOpenChange,
  event,
}: ConfirmDeleteTimelineModalProps) {
  const { mutate: deleteEvent, isPending } = useDeleteTimelineMutation();

  const handleConfirm = () => {
    if (!event) return;
    deleteEvent(event.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove "{event?.title}" from the timeline?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
