import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import type { InvitationEditController } from "../hooks/useInvitationEditForm";

// Reset the design draft to the template base config. Synchronous (no mutation),
// so it just closes on confirm; the user still Saves to persist.
const ResetModal = ({ edit }: { edit: InvitationEditController }) => {
  const open = useInvitationModalStore((s) => s.confirm === "reset");
  const closeConfirm = useInvitationModalStore((s) => s.closeConfirm);

  return (
    <ConfirmAlertModal
      open={open}
      onOpenChange={(o) => !o && closeConfirm()}
      variant="warning"
      title="Reset to template?"
      description="This replaces your current design draft with the template's defaults. RSVP settings are untouched, and you'll still need to Save."
      confirmLabel="Reset"
      onConfirm={() => {
        edit.resetToTemplate();
        closeConfirm();
      }}
    />
  );
};

export default ResetModal;
