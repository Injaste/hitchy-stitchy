import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

import { useVendorModalStore } from "../hooks/useVendorModalStore";
import { useVendorMutations } from "../queries";

const VendorDeleteModal = () => {
  const isDeleteOpen = useVendorModalStore((s) => s.isDeleteOpen);
  const selectedItem = useVendorModalStore((s) => s.selectedItem);
  const closeAll = useVendorModalStore((s) => s.closeAll);
  const { remove } = useVendorMutations();

  useCloseOnSuccess(remove.isSuccess, closeAll);

  if (!selectedItem) return null;
  const vendor = selectedItem;

  return (
    <ConfirmAlertModal
      open={isDeleteOpen}
      onOpenChange={closeAll}
      variant="destructive"
      title="Remove vendor"
      description={
        <>
          Are you sure you want to remove{" "}
          <span className="font-semibold text-foreground">"{vendor.name}"</span>{" "}
          from your vendor list? This action cannot be undone.
        </>
      }
      confirmLabel="Remove"
      onConfirm={() => remove.mutate({ id: vendor.id, name: vendor.name })}
      isPending={remove.isPending}
      isSuccess={remove.isSuccess}
      isError={remove.isError}
    />
  );
};

export default VendorDeleteModal;
