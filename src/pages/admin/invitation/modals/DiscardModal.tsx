import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import type { InvitationEditController } from "../hooks/useInvitationEditForm";

// Drop unsaved edits, reverting to the last save. Synchronous → closes on confirm.
const DiscardModal = ({ edit }: { edit: InvitationEditController }) => {
  const open = useInvitationModalStore((s) => s.confirm === "discard");
  const closeConfirm = useInvitationModalStore((s) => s.closeConfirm);

  return (
    <ConfirmAlertModal
      open={open}
      onOpenChange={(o) => !o && closeConfirm()}
      variant="warning"
      title="Discard changes?"
      description="Your unsaved edits will be lost and the design reverts to the last save."
      confirmLabel="Discard"
      onConfirm={() => {
        edit.discardChanges();
        closeConfirm();
      }}
    />
  );
};

export default DiscardModal;
