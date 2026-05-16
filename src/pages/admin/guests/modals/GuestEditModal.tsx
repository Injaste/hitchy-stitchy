import {
  FormDialog,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/custom/form";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";

import GuestForm, { useGuestForm } from "./GuestForm";
import { useInvitationQuery } from "../../invitation/queries";

const GuestEditModal = () => {
  const isEditOpen = useGuestModalStore((s) => s.isEditOpen);
  const selectedItem = useGuestModalStore((s) => s.selectedItem);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const { update } = useGuestMutations();

  const { data: invitation } = useInvitationQuery();

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

  if (!selectedItem || !invitation) return null;

  return (
    <FormDialog
      form={form}
      open={isEditOpen}
      onOpenChange={closeAll}
      isPending={update.isPending}
      isSuccess={update.isSuccess}
      isError={update.isError}
    >
      <FormDialogHeader
        title="Edit guest"
        description="Update this guest's details."
      />

      <GuestForm maxGuest={invitation.guest_count_max} />

      <FormDialogFooter onCancel={closeAll} submitLabel="Save changes" />
    </FormDialog>
  );
};

export default GuestEditModal;
