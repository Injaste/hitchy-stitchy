import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

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

  const handleConfirm = () => {
    remove.mutate({ event_id: eventId!, id: theme.id, name: theme.name });
  };

  return (
    <ConfirmAlertModal
      open={isDeleteOpen}
      onOpenChange={closeAll}
      variant="destructive"
      title="Delete theme"
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">"{theme.name}"</span>?
          This action cannot be undone.
        </>
      }
      confirmPhrase={theme.name}
      confirmLabel="Delete"
      onConfirm={handleConfirm}
      isPending={remove.isPending}
      isSuccess={remove.isSuccess}
      isError={remove.isError}
    />
  );
};

export default DeleteThemeModal;
