import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";
import { TriangleAlert } from "lucide-react";

import { useTimelineMutations } from "../queries";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useAdminStore } from "../../store/useAdminStore";

const TimelineDeleteModal = () => {
  const isDeleteOpen = useTimelineModalStore((s) => s.isDeleteOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);

  const { eventId } = useAdminStore();
  const { remove } = useTimelineMutations();

  useCloseOnSuccess(remove.isSuccess, closeAll);

  if (!selectedItem) return null;
  const item = selectedItem;

  const handleConfirm = () => {
    remove.mutate({ event_id: eventId!, id: item.id, title: item.title });
  };

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={closeAll}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 shrink-0" />
            Delete item
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
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
          <SubmitButton
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            isPending={remove.isPending}
            isSuccess={remove.isSuccess}
            isError={remove.isError}
          >
            Delete
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TimelineDeleteModal;
