import { Store } from "lucide-react";

import { FormDialog, FormFooter, FormHeader } from "@/components/custom/form";

import { useVendorModalStore } from "../hooks/useVendorModalStore";
import { useVendorMutations } from "../queries";

import VendorForm, { useVendorForm } from "./VendorForm";

const VendorEditModal = () => {
  const isEditOpen = useVendorModalStore((s) => s.isEditOpen);
  const selectedItem = useVendorModalStore((s) => s.selectedItem);
  const closeAll = useVendorModalStore((s) => s.closeAll);
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

      {/* Just a form now — Delete lives on the detail modal it opens from,
          same as MemberEditModal. */}
      <FormFooter onCancel={closeAll} submitLabel="Save changes" />
    </FormDialog>
  );
};

export default VendorEditModal;
