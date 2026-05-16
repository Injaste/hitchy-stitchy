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
import { useInvitationQuery } from "../../invitation/queries";

const GuestCreateModal = () => {
  const isCreateOpen = useGuestModalStore((s) => s.isCreateOpen);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const { create } = useGuestMutations();

  const { data: invitation } = useInvitationQuery();

  const form = useGuestForm({
    onSubmit: (values) => {
      create.mutate({
        name: values.name,
        phone: values.phone,
        guest_count: values.guest_count,
        status: values.status,
        message: values.message,
      });
    },
  });

  if (!invitation) return null;

  return (
    <FormDialog
      form={form}
      open={isCreateOpen}
      onOpenChange={closeAll}
      isPending={create.isPending}
      isSuccess={create.isSuccess}
      isError={create.isError}
    >
      <DialogHeader>
        <DialogTitle>Add guest</DialogTitle>
        <DialogDescription>
          Add a new guest to your list. You can update their RSVP status later.
        </DialogDescription>
      </DialogHeader>

      <GuestForm maxGuest={invitation.guest_count_max} />

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
