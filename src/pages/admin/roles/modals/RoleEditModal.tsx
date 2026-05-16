import {
  FormDialog,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/custom/form";

import { useRoleModalStore } from "../hooks/useRoleModalStore";
import { useRoleMutations } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import type { RoleFormValues } from "../types";

import RoleForm, { useRoleForm } from "./RoleForm";

const RoleEditModal = () => {
  const isEditOpen = useRoleModalStore((s) => s.isEditOpen);
  const selectedItem = useRoleModalStore((s) => s.selectedItem);
  const closeAll = useRoleModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { update } = useRoleMutations();

  const form = useRoleForm({
    defaultValues: selectedItem
      ? {
          name: selectedItem.name,
          short_name: selectedItem.short_name,
          category: selectedItem.category as RoleFormValues["category"],
          description: selectedItem.description ?? "",
        }
      : undefined,
    onSubmit: (values) => {
      if (!selectedItem) return;
      update.mutate({
        event_id: eventId!,
        id: selectedItem.id,
        name: values.name,
        short_name: values.short_name,
        category: values.category,
        description: values.description,
      });
    },
  });

  if (!selectedItem) return null;
  const lockCategory = selectedItem.category === "root";

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
        title="Edit role"
        description="Update this role's details."
      />

      <RoleForm lockCategory={lockCategory} />

      <FormDialogFooter onCancel={closeAll} submitLabel="Save changes" />
    </FormDialog>
  );
};

export default RoleEditModal;

// TODO CHECK WHEN ERROR STATE, THE SHAKING OVERFLOWS AND CAUSES A SCROLLBAR TO APPEAR FIX THAT...
