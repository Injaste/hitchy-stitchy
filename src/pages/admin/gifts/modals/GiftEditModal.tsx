import { HandCoins } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FormDialog, FormHeader, SubmitButton } from "@/components/custom/form";

import { useGiftModalStore } from "../hooks/useGiftModalStore";
import { useGiftMutations } from "../queries";

import GiftForm, { useGiftForm } from "./GiftForm";

const GiftEditModal = () => {
  const isEditOpen = useGiftModalStore((s) => s.isEditOpen);
  const selectedItem = useGiftModalStore((s) => s.selectedItem);
  const closeAll = useGiftModalStore((s) => s.closeAll);
  const openDeleteItem = useGiftModalStore((s) => s.openDeleteItem);
  const { update } = useGiftMutations();

  const form = useGiftForm({
    defaultValues: selectedItem
      ? {
          given_by: selectedItem.given_by,
          amount: selectedItem.amount,
          method: selectedItem.method,
          notes: selectedItem.notes,
          day_id: selectedItem.day_id,
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
      <FormHeader icon={<HandCoins className="size-4" />} title="Edit gift" />

      <GiftForm />

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

export default GiftEditModal;
