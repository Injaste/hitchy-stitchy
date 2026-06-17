import { User } from "lucide-react";

import {
  FormDialog,
  FormFooter,
  FormHeader,
} from "@/components/custom/form";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";
import { useEventInvitationsQuery } from "../../invitation/queries";

import GuestForm, { useGuestForm, type GuestPageOption } from "./GuestForm";

const GuestEditModal = () => {
  const isEditOpen = useGuestModalStore((s) => s.isEditOpen);
  const selectedItem = useGuestModalStore((s) => s.selectedItem);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const { update } = useGuestMutations();

  // Party-size bounds + the message field come from the guest's own page; a
  // guest can't change pages here, so the page picker stays implicit.
  const { data: invitations } = useEventInvitationsQuery();
  const invitation = (invitations ?? []).find(
    (i) => i.id === selectedItem?.invitation_id,
  );
  const pages: GuestPageOption[] = invitation
    ? [
        {
          id: invitation.id,
          label: "",
          minGuest: invitation.guest_count_min,
          maxGuest: invitation.guest_count_max,
          showMessage: invitation.rsvp_config.rsvp.fields.message.visible,
        },
      ]
    : [];

  const form = useGuestForm({
    pages: pages.length ? pages : [{ id: "", label: "", minGuest: 1, maxGuest: 1, showMessage: false }],
    pageId: invitation?.id ?? "",
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
      <FormHeader icon={<User className="size-4" />} title="Edit guest" />
      <GuestForm pages={pages} />
      <FormFooter onCancel={closeAll} submitLabel="Save changes" />
    </FormDialog>
  );
};

export default GuestEditModal;
