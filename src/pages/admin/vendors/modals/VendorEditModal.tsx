import { Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FormDialog, FormHeader, SubmitButton } from "@/components/custom/form";

import { useVendorModalStore } from "../hooks/useVendorModalStore";
import { useVendorMutations } from "../queries";

import VendorForm, { useVendorForm } from "./VendorForm";

const VendorEditModal = () => {
  const isEditOpen = useVendorModalStore((s) => s.isEditOpen);
  const selectedItem = useVendorModalStore((s) => s.selectedItem);
  const closeAll = useVendorModalStore((s) => s.closeAll);
  const openDeleteItem = useVendorModalStore((s) => s.openDeleteItem);
  const { update } = useVendorMutations();

  const form = useVendorForm({
    defaultValues: selectedItem
      ? {
          name: selectedItem.name,
          category: selectedItem.category,
          contact_phone: selectedItem.contact_phone,
          contact_email: selectedItem.contact_email,
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
      <FormHeader icon={<Store className="size-4" />} title="Edit vendor" />

      <VendorForm />

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

export default VendorEditModal;
