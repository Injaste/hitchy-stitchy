import { Wallet } from "lucide-react";

import { FormDialog, FormFooter, FormHeader } from "@/components/custom/form";

import { useExpenseModalStore } from "../hooks/useExpenseModalStore";
import { useExpenseMutations } from "../queries";

import ExpenseForm, { useExpenseForm } from "./ExpenseForm";

const ExpenseCreateModal = () => {
  const isCreateOpen = useExpenseModalStore((s) => s.isCreateOpen);
  const closeAll = useExpenseModalStore((s) => s.closeAll);
  const isCreateMore = useExpenseModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useExpenseModalStore((s) => s.setIsCreateMore);
  const { create } = useExpenseMutations();

  const form = useExpenseForm({
    onSubmit: (values) => create.mutate(values),
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

      <ExpenseForm />

      <FormFooter
        onCancel={closeAll}
        submitLabel="Add expense"
        createMore={{ checked: isCreateMore, onChange: setIsCreateMore }}
      />
    </FormDialog>
  );
};

export default ExpenseCreateModal;
