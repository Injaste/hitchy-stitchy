import { User } from "lucide-react";

import {
  FormDialog,
  FormFooter,
  FormHeader,
} from "@/components/custom/form";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestTargetPages } from "../hooks/useGuestTargetPages";
import { useGuestMutations } from "../queries";
import { useInvitationsQuery } from "../../invitation/queries";

import GuestForm, { useGuestForm } from "./GuestForm";

const GuestEditModal = () => {
  const isEditOpen = useGuestModalStore((s) => s.isEditOpen);
  const selectedItem = useGuestModalStore((s) => s.selectedItem);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const { update } = useGuestMutations();

  // All event pages so a guest can be moved between them; bounds + the message
  // field follow the page selected in-form (validated against it, server too).
  const { allPages: pages } = useGuestTargetPages();
  const { data: invitations } = useInvitationsQuery();
  const invitation = (invitations ?? []).find(
    (i) => i.id === selectedItem?.invitation_id,
  );

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
    onSubmit: (values, pageIds) => {
      if (!selectedItem) return;
      const targetPage = pageIds[0];
      update.mutate({
        event_id: selectedItem.event_id,
        id: selectedItem.id,
        name: values.name,
        phone: values.phone,
        guest_count: values.guest_count,
        message: values.message,
        status: values.status,
        // Only on an actual move — keeps normal edits on the pre-migration RPC.
        invitation_id:
          targetPage !== selectedItem.invitation_id ? targetPage : undefined,
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
      <FormFooter onCancel={closeAll} submitLabel="Save" />
    </FormDialog>
  );
};

export default GuestEditModal;
