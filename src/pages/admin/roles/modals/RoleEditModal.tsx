import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useRoleModalStore } from "../hooks/useRoleModalStore";
import { useRoleMutations } from "../queries";
import type { RoleFormValues } from "../types";

import RoleForm from "./RoleForm";

const RoleEditModal = () => {
  const isEditOpen = useRoleModalStore((s) => s.isEditOpen);
  const selectedItem = useRoleModalStore((s) => s.selectedItem);
  const closeAll = useRoleModalStore((s) => s.closeAll);
  const { update } = useRoleMutations();

  if (!selectedItem) return null;
  const role = selectedItem;

  const handleSubmit = (values: RoleFormValues) => {
    update.mutate({
      id: role.id,
      name: values.name,
      short_name: values.short_name,
      category: values.category,
      description: values.description,
    });
  };

  return (
    <Dialog open={isEditOpen} onOpenChange={closeAll}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit role</DialogTitle>
          <DialogDescription>Update this role's details.</DialogDescription>
        </DialogHeader>
        <RoleForm
          defaultValues={{
            name: role.name,
            short_name: role.short_name,
            category: role.category as RoleFormValues["category"],
            description: role.description ?? "",
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

export default RoleEditModal;
