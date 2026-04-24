import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";
import type { GuestFormValues } from "../types";

import GuestForm from "./GuestForm";

const GuestEditModal = () => {
  const isEditOpen = useGuestModalStore((s) => s.isEditOpen);
  const selectedItem = useGuestModalStore((s) => s.selectedItem);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const { update } = useGuestMutations();

  if (!selectedItem) return null;
  const guest = selectedItem;

  const handleSubmit = (values: GuestFormValues) => {
    update.mutate({
      id: guest.id,
      name: values.name,
      phone: values.phone,
      guest_count: values.guest_count,
      message: values.message,
    });
  };

  return (
    <Dialog open={isEditOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit guest</DialogTitle>
          <DialogDescription>Update this guest's details.</DialogDescription>
        </DialogHeader>
        <GuestForm
          defaultValues={{
            name: guest.name,
            phone: guest.phone,
            guest_count: guest.guest_count,
            message: guest.message,
          }}
          onSubmit={handleSubmit}
          onCancel={closeAll}
          isPending={update.isPending}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
};

export default GuestEditModal;
