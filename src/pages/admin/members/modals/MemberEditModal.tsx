import {
  FormDialog,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/custom/form";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import MemberForm, { useMemberEditForm } from "./MemberForm";

const MemberEditModal = () => {
  const isEditOpen = useMemberModalStore((s) => s.isEditOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const { eventId, memberId } = useAdminStore();
  const { update, updateMyName } = useMemberMutations();

  // Hook before guard. Parent index keys this modal by selectedItem.id so
  // useForm re-initialises with fresh defaults on every member selection.
  const form = useMemberEditForm({
    defaultValues: selectedItem
      ? {
          display_name: selectedItem.display_name,
          role_id: selectedItem.role_id ?? "",
        }
      : undefined,
    onSubmit: (values) => {
      if (!selectedItem) return;
      const roleChanged = values.role_id !== selectedItem.role_id;
      if (roleChanged) {
        update.mutate({
          event_id: eventId!,
          id: selectedItem.id,
          display_name: values.display_name,
          role_id: values.role_id,
        });
      } else {
        updateMyName.mutate(values.display_name);
      }
    },
  });

  if (!selectedItem) return null;

  // Lock the role selector when editing the root member. Member has the role
  // object embedded, so we don't need to look it up.
  const lockRole = selectedItem.role.category === "root";

  // Mirror MemberDetailModal: email is visible only to the member themselves
  // or to the inviter.
  const canSeeEmail =
    selectedItem.id === memberId || selectedItem.invited_by === memberId;

  return (
    <FormDialog
      form={form}
      open={isEditOpen}
      onOpenChange={closeAll}
      isPending={update.isPending || updateMyName.isPending}
      isSuccess={update.isSuccess || updateMyName.isSuccess}
      isError={update.isError || updateMyName.isError}
    >
      <FormDialogHeader
        title="Edit member"
        description="Update this member's details or role."
      />

      <MemberForm
        mode="edit"
        lockRole={lockRole}
        email={canSeeEmail ? selectedItem.email : undefined}
      />

      <FormDialogFooter onCancel={closeAll} submitLabel="Save changes" />
    </FormDialog>
  );
};

export default MemberEditModal;
