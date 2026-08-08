import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import type { InvitationEditController } from "../hooks/useInvitationEditForm";

// Changing the link on a LIVE page breaks any copy already sent out (a
// forwarded WhatsApp message 404s) — confirm first. Draft pages skip this
// dialog entirely: useInvitationEditForm saves immediately since nobody has
// the link yet.
const SetLinkSlugModal = ({ edit }: { edit: InvitationEditController }) => {
  const open = useInvitationModalStore((s) => s.confirm === "link");
  const closeConfirm = useInvitationModalStore((s) => s.closeConfirm);

  useCloseOnSuccess(edit.setLinkSlugSuccess, closeConfirm);

  return (
    <ConfirmAlertModal
      open={open}
      onOpenChange={(o) => !o && closeConfirm()}
      variant="warning"
      title="Change the page link?"
      description="Guests who already have the current link will see a Not found page. Anyone with the new link will be able to open this page."
      confirmLabel="Change link"
      isPending={edit.setLinkSlugPending}
      isSuccess={edit.setLinkSlugSuccess}
      isError={edit.setLinkSlugError}
      onConfirm={() => edit.saveLinkSlug(edit.pendingLinkSlug)}
    />
  );
};

export default SetLinkSlugModal;
