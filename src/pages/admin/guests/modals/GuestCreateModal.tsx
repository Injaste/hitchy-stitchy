import {
  FormDialog,
  FormFooter,
  FormHeader,
} from "@/components/custom/form";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";

import GuestForm, { useGuestForm } from "./GuestForm";
import { useInvitationQuery } from "../../invitation/queries";

const GuestCreateModal = () => {
  const isCreateOpen = useGuestModalStore((s) => s.isCreateOpen);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const isCreateMore = useGuestModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useGuestModalStore((s) => s.setIsCreateMore);
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
      closeDelay={isCreateMore ? false : 300}
      resetOnSuccess={isCreateMore}
    >
      <FormHeader title="Add guest" />

      <GuestForm maxGuest={invitation.guest_count_max} />

      <FormFooter
        onCancel={closeAll}
        submitLabel="Add guest"
        createMore={{ checked: isCreateMore, onChange: setIsCreateMore }}
      />
    </FormDialog>
  );
};

export default GuestCreateModal;
