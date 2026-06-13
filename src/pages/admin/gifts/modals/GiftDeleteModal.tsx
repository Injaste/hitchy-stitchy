import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

import { useGiftModalStore } from "../hooks/useGiftModalStore";
import { useGiftMutations } from "../queries";

const GiftDeleteModal = () => {
  const isDeleteOpen = useGiftModalStore((s) => s.isDeleteOpen);
  const selectedItem = useGiftModalStore((s) => s.selectedItem);
  const closeAll = useGiftModalStore((s) => s.closeAll);
  const { remove } = useGiftMutations();

  useCloseOnSuccess(remove.isSuccess, closeAll);

  if (!selectedItem) return null;
  const gift = selectedItem;

  return (
    <ConfirmAlertModal
      open={isDeleteOpen}
      onOpenChange={closeAll}
      variant="destructive"
      title="Remove gift"
      description={
        <>
          Are you sure you want to remove{" "}
          <span className="font-semibold text-foreground">"{gift.given_by}"</span>
          's gift from your ledger? This action cannot be undone.
        </>
      }
      confirmLabel="Remove"
      onConfirm={() => remove.mutate({ id: gift.id, given_by: gift.given_by })}
      isPending={remove.isPending}
      isSuccess={remove.isSuccess}
      isError={remove.isError}
    />
  );
};

export default GiftDeleteModal;
