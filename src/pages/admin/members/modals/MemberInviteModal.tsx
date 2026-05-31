import {
  FormDialog,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations } from "../queries";

import MemberForm, { useMemberInviteForm } from "./MemberForm";

const MemberInviteModal = () => {
  const isInviteOpen = useMemberModalStore((s) => s.isCreateOpen);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const isCreateMore = useMemberModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useMemberModalStore((s) => s.setIsCreateMore);
  const { eventId } = useAdminStore();
  const { invite } = useMemberMutations();

  const form = useMemberInviteForm({
    onSubmit: (values) => {
      invite.mutate({
        event_id: eventId!,
        display_name: values.display_name,
        email: values.email,
        role_id: values.role_id,
        label: values.label ?? null,
        notes: values.notes ?? null,
      });
    },
  });

  return (
    <FormDialog
      form={form}
      open={isInviteOpen}
      onOpenChange={closeAll}
      isPending={invite.isPending}
      isSuccess={invite.isSuccess}
      isError={invite.isError}
      closeDelay={isCreateMore ? false : 300}
      resetOnSuccess={isCreateMore}
    >
      <FormDialogHeader
        title="Invite member"
        description="Send an invitation to join this event."
      />

      <MemberForm mode="invite" />

      <FormDialogFooter
        onCancel={closeAll}
        submitLabel="Send invite"
        createMore={{
          checked: isCreateMore,
          onChange: setIsCreateMore,
          label: "Invite more",
        }}
      />
    </FormDialog>
  );
};

export default MemberInviteModal;
