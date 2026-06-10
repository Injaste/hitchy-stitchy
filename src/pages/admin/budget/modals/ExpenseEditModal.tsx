import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FormDialog, FormHeader, SubmitButton } from "@/components/custom/form";

import { useExpenseModalStore } from "../hooks/useExpenseModalStore";
import { useExpenseMutations } from "../queries";

import ExpenseForm, { useExpenseForm } from "./ExpenseForm";

const ExpenseEditModal = () => {
  const isEditOpen = useExpenseModalStore((s) => s.isEditOpen);
  const selectedItem = useExpenseModalStore((s) => s.selectedItem);
  const closeAll = useExpenseModalStore((s) => s.closeAll);
  const openDeleteItem = useExpenseModalStore((s) => s.openDeleteItem);
  const { update } = useExpenseMutations();

  const form = useExpenseForm({
    defaultValues: selectedItem
      ? {
          item: selectedItem.item,
          vendor_name: selectedItem.vendor_name,
          payer: selectedItem.payer,
          amount: selectedItem.amount,
          paid: selectedItem.paid,
          due_at: selectedItem.due_at,
          notes: selectedItem.notes,
        }
      : undefined,
    onSubmit: (values) => {
      if (!selectedItem) return;
      update.mutate({
        event_id: selectedItem.event_id,
        id: selectedItem.id,
        ...values,
      });
    },
  });

  if (!selectedItem) return null;

  return (
    <FormDialog
      form={form}
      open={isEditOpen}
      onOpenChange={closeAll}
      isPending={update.isPending}
      isSuccess={update.isSuccess}
      isError={update.isError}
    >
      <FormHeader icon={<Wallet className="size-4" />} title="Edit expense" />

      <ExpenseForm autoFocusPaid />

      {/* Footer mirrors DialogDetailActions: destructive Delete · Cancel · Save. */}
      <DialogFooter>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => openDeleteItem(selectedItem)}
        >
          Delete
        </Button>
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <Button type="button" variant="outline" size="sm" onClick={closeAll}>
          Cancel
        </Button>
        <SubmitButton size="sm">Save</SubmitButton>
      </DialogFooter>
    </FormDialog>
  );
};

export default ExpenseEditModal;
