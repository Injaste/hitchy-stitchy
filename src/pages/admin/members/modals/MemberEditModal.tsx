import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormDialog, SubmitButton } from "@/components/custom/form";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import MemberForm, { useMemberEditForm } from "./MemberForm";

const MemberEditModal = () => {
  const isEditOpen = useMemberModalStore((s) => s.isEditOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { update } = useMemberMutations();

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
      update.mutate({
        event_id: eventId!,
        id: selectedItem.id,
        display_name: values.display_name,
        role_id: values.role_id,
      });
    },
  });

  if (!selectedItem) return null;

  // Lock the role selector when editing the root member. Member has the role
  // object embedded, so we don't need to look it up.
  const lockRole = selectedItem.role.category === "root";

  return (
    <FormDialog
      form={form}
      open={isEditOpen}
      onOpenChange={closeAll}
      isPending={update.isPending}
      isSuccess={update.isSuccess}
      isError={update.isError}
    >
      <DialogHeader>
        <DialogTitle>Edit member</DialogTitle>
        <DialogDescription>
          Update this member's details or role.
        </DialogDescription>
      </DialogHeader>

      <MemberForm mode="edit" lockRole={lockRole} />

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

export default MemberEditModal;
