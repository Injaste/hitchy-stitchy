import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import type { InvitationEditController } from "../hooks/useInvitationEditForm";

interface DeleteModalProps {
  edit: InvitationEditController;
  onSheetClose: () => void;
}

// Hard delete. Guarded while published (the server blocks it too). On success the
// invitation is gone, so the sheet closes with the confirm.
const DeleteModal = ({ edit, onSheetClose }: DeleteModalProps) => {
  const open = useInvitationModalStore((s) => s.confirm === "delete");
  const closeConfirm = useInvitationModalStore((s) => s.closeConfirm);

  useCloseOnSuccess(edit.deleteSuccess, () => {
    closeConfirm();
    onSheetClose();
  });

  return (
    <ConfirmAlertModal
      open={open}
      onOpenChange={(o) => !o && closeConfirm()}
      variant="destructive"
      title="Delete invitation?"
      description={
        edit.isScheduled
          ? "Cancel the scheduled publish before deleting it."
          : edit.isPublished
            ? "Unpublish this invitation before deleting it."
            : "This permanently removes the invitation and its design. This can't be undone."
      }
      confirmLabel="Delete"
      confirmDisabled={edit.isPublished}
      isPending={edit.deletePending}
      isSuccess={edit.deleteSuccess}
      isError={edit.deleteError}
      onConfirm={edit.handleDelete}
    />
  );
};

export default DeleteModal;
