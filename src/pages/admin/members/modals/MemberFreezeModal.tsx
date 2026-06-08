import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

const MemberFreezeModal = () => {
  const isFreezeOpen = useMemberModalStore((s) => s.isFreezeOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { freeze } = useMemberMutations();

  useCloseOnSuccess(freeze.isSuccess, closeAll);

  if (!selectedItem) return null;
  const member = selectedItem;
  const willFreeze = !member.frozen_at;

  const handleConfirm = () => {
    freeze.mutate({ event_id: eventId!, id: member.id, freeze: willFreeze });
  };

  return (
    <ConfirmAlertModal
      open={isFreezeOpen}
      onOpenChange={closeAll}
      variant={willFreeze ? "freeze" : "sun"}
      title={willFreeze ? "Freeze access" : "Restore access"}
      description={
        willFreeze ? (
          <>
            <span className="font-semibold text-foreground">
              {member.display_name}
            </span>{" "}
            will lose access to the event until restored. Their record stays in
            place.
          </>
        ) : (
          <>
            Restore access for{" "}
            <span className="font-semibold text-foreground">
              {member.display_name}
            </span>
            ? They will regain full access to the event.
          </>
        )
      }
      confirmLabel={willFreeze ? "Freeze access" : "Restore access"}
      onConfirm={handleConfirm}
      isPending={freeze.isPending}
      isSuccess={freeze.isSuccess}
      isError={freeze.isError}
    />
  );
};

export default MemberFreezeModal;
