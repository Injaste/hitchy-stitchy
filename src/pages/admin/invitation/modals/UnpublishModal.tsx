import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import type { InvitationEditController } from "../hooks/useInvitationEditForm";

// Take the live page down (clears published_at). Re-publishable anytime.
const UnpublishModal = ({ edit }: { edit: InvitationEditController }) => {
  const open = useInvitationModalStore((s) => s.confirm === "unpublish");
  const closeConfirm = useInvitationModalStore((s) => s.closeConfirm);

  useCloseOnSuccess(edit.unpublishSuccess, closeConfirm);

  return (
    <ConfirmAlertModal
      open={open}
      onOpenChange={(o) => !o && closeConfirm()}
      variant="warning"
      title="Unpublish invitation?"
      description="Guests will no longer be able to open the page. You can publish again anytime."
      confirmLabel="Unpublish"
      isPending={edit.unpublishPending}
      isSuccess={edit.unpublishSuccess}
      isError={edit.unpublishError}
      onConfirm={edit.handleUnpublish}
    />
  );
};

export default UnpublishModal;
