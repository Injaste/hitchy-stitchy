import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
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
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 shrink-0" />
            Delete item
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed text-left">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{item.title}"
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            variant="outline"
            size="sm"
            onClick={closeAll}
            disabled={remove.isPending}
            autoFocus
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="sm"
            onClick={() => remove.mutate(item.id)}
            disabled={remove.isPending}
          >
            {remove.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TimelineDeleteModal;
