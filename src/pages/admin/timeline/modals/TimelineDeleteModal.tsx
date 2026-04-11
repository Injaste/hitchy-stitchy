import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { useTimelineMutations } from "../queries";
import { useTimelineModalStore } from "../hooks/useTimelineStore";
import { TriangleAlert } from "lucide-react";

const TimelineDeleteModal = () => {
  const isDeleteOpen = useTimelineModalStore((s) => s.isDeleteOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);

  const { remove } = useTimelineMutations();

  if (!selectedItem) return null;
  const item = selectedItem;

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={closeAll}>
      <AlertDialogContent className="">
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle
            className="flex gap-2 items-center "
            aria-describedby="delete item"
          >
            <TriangleAlert />
            Delete item
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{item.title}"
            </span>
            ? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
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
