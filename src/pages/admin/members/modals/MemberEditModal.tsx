import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations } from "../queries";
import type { EditMemberValues } from "../types";

import MemberForm from "./MemberForm";

const MemberEditModal = () => {
  const isEditOpen = useMemberModalStore((s) => s.isEditOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const { update } = useMemberMutations();

  if (!selectedItem) return null;
  const member = selectedItem;

  const handleSubmit = (values: EditMemberValues) => {
    update.mutate({
      id: member.id,
      display_name: values.display_name,
      role_id: values.role_id,
    });
  };

  return (
    <Dialog open={isEditOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit member</DialogTitle>
          <DialogDescription>
            Update this member's details or role.
          </DialogDescription>
        </DialogHeader>
        <MemberForm
          mode="edit"
          defaultValues={{
            display_name: member.display_name,
            role_id: member.role_id ?? "",
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

export default MemberEditModal;
