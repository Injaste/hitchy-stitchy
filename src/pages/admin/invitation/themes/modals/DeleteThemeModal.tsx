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
import { useInvitationModalStore } from "../../store/useInvitationModalStore";
import { useThemesMutations } from "../../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

const DeleteThemeModal = () => {
  const isDeleteOpen = useInvitationModalStore((s) => s.isDeleteOpen);
  const selectedItem = useInvitationModalStore((s) => s.selectedItem);
  const closeAll = useInvitationModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { remove } = useThemesMutations();

  useCloseOnSuccess(remove.isSuccess, closeAll);

  if (!selectedItem) return null;
  const theme = selectedItem;

  const handleConfirm = () => remove.mutate(theme.id);

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={closeAll}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 shrink-0" />
            Delete theme
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{theme.name}"
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

export default DeleteThemeModal;
