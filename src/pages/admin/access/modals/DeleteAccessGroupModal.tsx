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
import { useAccessModalStore } from "../hooks/useAccessModalStore";
import { useAccessGroupMutations } from "../queries";

const DeleteAccessGroupModal = () => {
  const { isDeleteOpen, selectedItem: group, closeAll } = useAccessModalStore();
  const { remove } = useAccessGroupMutations();

  const handleConfirm = () => {
    if (!group) return;
    remove.mutate(
      { event_id: group.event_id, id: group.id, name: group.name },
      { onSuccess: closeAll },
    );
  };

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={(open) => !open && closeAll()}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle>Delete access group</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{group?.name}"</span>
            ? Members assigned to this group will lose it but stay in the event.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" size="sm" autoFocus>
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

export default DeleteAccessGroupModal;
