import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

import { useExpenseModalStore } from "../hooks/useExpenseModalStore";
import { useExpenseMutations } from "../queries";

const ExpenseDeleteModal = () => {
  const isDeleteOpen = useExpenseModalStore((s) => s.isDeleteOpen);
  const selectedItem = useExpenseModalStore((s) => s.selectedItem);
  const closeAll = useExpenseModalStore((s) => s.closeAll);
  const { remove } = useExpenseMutations();

  useCloseOnSuccess(remove.isSuccess, closeAll);

  if (!selectedItem) return null;
  const expense = selectedItem;

  return (
    <ConfirmAlertModal
      open={isDeleteOpen}
      onOpenChange={closeAll}
      variant="destructive"
      title="Remove expense"
      description={
        <>
          Are you sure you want to remove{" "}
          <span className="font-semibold text-foreground">
            "{expense.item}"
          </span>{" "}
          from your budget? This action cannot be undone.
        </>
      }
      confirmLabel="Remove"
      onConfirm={() => remove.mutate({ id: expense.id, item: expense.item })}
      isPending={remove.isPending}
      isSuccess={remove.isSuccess}
      isError={remove.isError}
    />
  );
};

export default ExpenseDeleteModal;
