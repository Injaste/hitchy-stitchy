import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import type { InvitationEditController } from "../hooks/useInvitationEditForm";

// Atomic publish (save + promote). Open-state from the store; the form-coupled
// action comes from the editor controller.
const PublishModal = ({ edit }: { edit: InvitationEditController }) => {
  const open = useInvitationModalStore((s) => s.confirm === "publish");
  const closeConfirm = useInvitationModalStore((s) => s.closeConfirm);

  useCloseOnSuccess(edit.publishSuccess, closeConfirm);

  return (
    <ConfirmAlertModal
      open={open}
      onOpenChange={(o) => !o && closeConfirm()}
      variant="default"
      title={edit.isLive ? "Publish changes?" : "Publish invitation?"}
      description={
        edit.isLive
          ? "This updates the live page your guests see with your current design."
          : "This makes the page live — anyone with the link can open it."
      }
      confirmLabel="Publish"
      isPending={edit.publishPending}
      isSuccess={edit.publishSuccess}
      isError={edit.publishError}
      onConfirm={() => edit.commitPublish().catch(() => {})}
    />
  );
};

export default PublishModal;
