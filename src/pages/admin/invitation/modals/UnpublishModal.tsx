import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import type { InvitationEditController } from "../hooks/useInvitationEditForm";

// Take the live page down (clears published_at). For a scheduled page this is
// the same RPC — it just cancels the pending publish. Re-publishable anytime.
const UnpublishModal = ({ edit }: { edit: InvitationEditController }) => {
  const open = useInvitationModalStore((s) => s.confirm === "unpublish");
  const closeConfirm = useInvitationModalStore((s) => s.closeConfirm);

  useCloseOnSuccess(edit.unpublishSuccess, closeConfirm);

  return (
    <ConfirmAlertModal
      open={open}
      onOpenChange={(o) => !o && closeConfirm()}
      variant="warning"
      title={
        edit.isScheduled ? "Cancel scheduled publish?" : "Unpublish invitation?"
      }
      description={
        edit.isScheduled
          ? "The page won't go live at the scheduled time. You can publish or reschedule anytime."
          : "Guests will no longer be able to open the page. You can publish again anytime."
      }
      confirmLabel={edit.isScheduled ? "Cancel schedule" : "Unpublish"}
      isPending={edit.unpublishPending}
      isSuccess={edit.unpublishSuccess}
      isError={edit.unpublishError}
      onConfirm={edit.handleUnpublish}
    />
  );
};

export default UnpublishModal;
