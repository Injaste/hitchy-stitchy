import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormDialog, SubmitButton } from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";

import GuestForm, { useGuestForm } from "./GuestForm";

const GuestCreateModal = () => {
  const isCreateOpen = useGuestModalStore((s) => s.isCreateOpen);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { create } = useGuestMutations();

  const form = useGuestForm({
    onSubmit: (values) => {
      create.mutate({
        event_id: eventId!,
        name: values.name,
        phone: values.phone,
        guest_count: values.guest_count,
        status: values.status,
        message: values.message,
      });
    },
  });

  return (
    <FormDialog
      form={form}
      open={isCreateOpen}
      onOpenChange={closeAll}
      isPending={create.isPending}
    >
      <DialogHeader>
        <DialogTitle>Add guest</DialogTitle>
        <DialogDescription>
          Add a new guest to your list. You can update their RSVP status later.
        </DialogDescription>
      </DialogHeader>

      <GuestForm />

      <Separator />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={closeAll}>
          Cancel
        </Button>
        <SubmitButton>Add guest</SubmitButton>
      </DialogFooter>
    </FormDialog>
  );
};

export default GuestCreateModal;
