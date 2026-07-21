import type { FC } from "react";

import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

import { useAccess } from "../../hooks/useAccess";
import { useBudgetQuery } from "../../budget/queries";
import { useVendorModalStore } from "../hooks/useVendorModalStore";
import { useVendorMutations } from "../queries";

/** What the delete costs, stated up front: linked expenses SURVIVE (the money was
 *  really spent) but lose their vendor, since nothing about the name is copied
 *  onto them. Mounted only for callers who can read budget — an Admin who manages
 *  vendors without money access shouldn't learn how many expenses exist. */
const LinkedExpensesNotice: FC<{ vendorId: string }> = ({ vendorId }) => {
  const { data } = useBudgetQuery();
  const count = (data?.expenses ?? []).filter(
    (e) => e.vendor_id === vendorId,
  ).length;

  if (count === 0) return null;

  return (
    <>
      {" "}
      <span className="font-semibold text-foreground">
        {count} linked {count === 1 ? "expense" : "expenses"}
      </span>{" "}
      will be kept, but will no longer show a vendor.
    </>
  );
};

const VendorDeleteModal = () => {
  const isDeleteOpen = useVendorModalStore((s) => s.isDeleteOpen);
  const selectedItem = useVendorModalStore((s) => s.selectedItem);
  const closeAll = useVendorModalStore((s) => s.closeAll);
  const { remove } = useVendorMutations();
  const { canRead } = useAccess();

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
          {canRead("budget") && <LinkedExpensesNotice vendorId={vendor.id} />}
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
