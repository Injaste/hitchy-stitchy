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
import { useRolesModalStore } from "../hooks/useRolesModalStore";
import { useRoleMutations } from "../queries";

const DeleteRoleModal = () => {
  const { isDeleteOpen, selectedItem: role, closeAll } = useRolesModalStore();
  const { remove } = useRoleMutations();

  const handleConfirm = () => {
    if (!role) return;
    remove.mutate(
      { event_id: role.event_id, id: role.id, name: role.name },
      { onSuccess: closeAll },
    );
  };

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={(open) => !open && closeAll()}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle>Delete role</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{role?.name}"</span>
            ? Members assigned to this role will lose it but stay in the event.
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

export default DeleteRoleModal;
