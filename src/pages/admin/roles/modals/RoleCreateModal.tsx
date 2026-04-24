import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useRoleModalStore } from "../hooks/useRoleModalStore";
import { useRoleMutations } from "../queries";
import type { RoleFormValues } from "../types";

import RoleForm from "./RoleForm";

const RoleCreateModal = () => {
  const isCreateOpen = useRoleModalStore((s) => s.isCreateOpen);
  const closeAll = useRoleModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { create } = useRoleMutations();

  const handleSubmit = (values: RoleFormValues) => {
    create.mutate({
      event_id: eventId!,
      name: values.name,
      short_name: values.short_name,
      category: values.category,
      description: values.description,
    });
  };

  return (
    <Dialog open={isCreateOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add role</DialogTitle>
          <DialogDescription>
            Define a new role for your event team.
          </DialogDescription>
        </DialogHeader>
        <RoleForm
          onSubmit={handleSubmit}
          onCancel={closeAll}
          isPending={create.isPending}
          submitLabel="Add role"
        />
      </DialogContent>
    </Dialog>
  );
};

export default RoleCreateModal;
