import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormDialog, SubmitButton } from "@/components/custom/form";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";

import GuestForm, { useGuestForm } from "./GuestForm";

const GuestEditModal = () => {
  const isEditOpen = useGuestModalStore((s) => s.isEditOpen);
  const selectedItem = useGuestModalStore((s) => s.selectedItem);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const { update } = useGuestMutations();

  // Hook before guard. Parent index keys this modal by selectedItem.id so
  // useForm re-initialises with fresh defaults on every guest selection.
  const form = useGuestForm({
    defaultValues: selectedItem
      ? {
          name: selectedItem.name,
          phone: selectedItem.phone,
          guest_count: selectedItem.guest_count,
          status: selectedItem.status,
          message: selectedItem.message,
        }
      : undefined,
    onSubmit: (values) => {
      if (!selectedItem) return;
      update.mutate({
        event_id: selectedItem.event_id,
        id: selectedItem.id,
        name: values.name,
        phone: values.phone,
        guest_count: values.guest_count,
        message: values.message,
        status: values.status,
        invite_code: selectedItem.invite_code,
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
    >
      <DialogHeader>
        <DialogTitle>Edit guest</DialogTitle>
        <DialogDescription>Update this guest's details.</DialogDescription>
      </DialogHeader>

      <GuestForm />

      <Separator />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={closeAll}>
          Cancel
        </Button>
        <SubmitButton>Save changes</SubmitButton>
      </DialogFooter>
    </FormDialog>
  );
};

export default GuestEditModal;
