import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

const MemberDeleteModal = () => {
  const isDeleteOpen = useMemberModalStore((s) => s.isDeleteOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { remove } = useMemberMutations();

  useCloseOnSuccess(remove.isSuccess, closeAll);

  if (!selectedItem) return null;
  const member = selectedItem;

  const handleConfirm = () => {
    remove.mutate({ event_id: eventId!, id: member.id, display_name: member.display_name });
  };

  return (
    <ConfirmAlertModal
      open={isDeleteOpen}
      onOpenChange={closeAll}
      variant="destructive"
      title="Delete access"
      description={
        <>
          <span className="font-semibold text-foreground">
            {member.display_name}
          </span>{" "}
          will be permanently removed from this event. Tasks they are assigned
          to will remain, but their name will be removed from those assignments.
        </>
      }
      confirmPhrase={member.display_name}
      confirmLabel="Delete access"
      onConfirm={handleConfirm}
      isPending={remove.isPending}
      isSuccess={remove.isSuccess}
      isError={remove.isError}
    />
  );
};

export default MemberDeleteModal;
