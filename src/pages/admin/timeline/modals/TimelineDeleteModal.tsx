import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

import { useTimelineMutations } from "../queries";
import { useTimelineModalStore } from "../hooks/useTimelineStore";

const TimelineDeleteModal = () => {
  const isDeleteOpen = useTimelineModalStore((s) => s.isDeleteOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);

  const { remove } = useTimelineMutations();

  if (!selectedItem) return null;
  const item = selectedItem;

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={closeAll}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle
            className="font-serif flex items-center gap-2"
            aria-describedby="delete item"
          >
            <TriangleAlert className="w-4 h-4 shrink-0" />
            Delete item
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-6 mt-1">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{item.title}"
            </span>
            ? This cannot be undone.
          </p>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={closeAll}
              disabled={remove.isPending}
              autoFocus
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => remove.mutate(item.id)}
              disabled={remove.isPending}
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TimelineDeleteModal;
