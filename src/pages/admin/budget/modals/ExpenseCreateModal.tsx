import { Wallet } from "lucide-react";

import { FormDialog, FormFooter, FormHeader } from "@/components/custom/form";

import { useExpenseModalStore } from "../hooks/useExpenseModalStore";
import { useExpenseMutations } from "../queries";
import { useVendorLookup } from "../../vendors/queries";

import ExpenseForm, { useExpenseForm } from "./ExpenseForm";

const ExpenseCreateModal = () => {
  const isCreateOpen = useExpenseModalStore((s) => s.isCreateOpen);
  const closeAll = useExpenseModalStore((s) => s.closeAll);
  const isCreateMore = useExpenseModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useExpenseModalStore((s) => s.setIsCreateMore);
  const { create } = useExpenseMutations();
  const vendors = useVendorLookup();
  // Set when opened from a vendor's detail: pre-link that vendor and its likely
  // day (the caller works the day out), and surface the Day select since there
  // are no day tabs over there to imply one.
  const createVendorId = useExpenseModalStore((s) => s.createVendorId);
  const createDayId = useExpenseModalStore((s) => s.createDayId);

  const form = useExpenseForm({
    defaultValues: createVendorId
      ? { vendor_id: createVendorId, day_id: createDayId }
      : undefined,
    // Snapshot the picked vendor's name so the label survives a vendor delete
    // (which nulls vendor_id via ON DELETE SET NULL).
    onSubmit: (values) =>
      create.mutate({
        ...values,
        vendor_name:
          (values.vendor_id && vendors.get(values.vendor_id)?.name) || null,
      }),
  });

  return (
    <FormDialog
      form={form}
      open={isCreateOpen}
      onOpenChange={closeAll}
      isPending={create.isPending}
      isSuccess={create.isSuccess}
      isError={create.isError}
      closeDelay={isCreateMore ? false : 300}
      resetOnSuccess={isCreateMore}
    >
      <FormHeader icon={<Wallet className="size-4" />} title="Add expense" />

      <ExpenseForm showDay={!!createVendorId} />

      <FormFooter
        onCancel={closeAll}
        submitLabel="Add expense"
        createMore={{ checked: isCreateMore, onChange: setIsCreateMore }}
      />
    </FormDialog>
  );
};

export default ExpenseCreateModal;
