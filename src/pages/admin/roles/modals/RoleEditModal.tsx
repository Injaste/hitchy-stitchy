import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/components/custom/form";
import { FormDialog } from "@/components/custom/form";

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
    >
      <DialogHeader>
        <DialogTitle>Edit role</DialogTitle>
        <DialogDescription>Update this role's details.</DialogDescription>
      </DialogHeader>

      <RoleForm lockCategory={lockCategory} />

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

export default RoleEditModal;

// TODO CHECK WHEN ERROR STATE, THE SHAKING OVERFLOWS AND CAUSES A SCROLLBAR TO APPEAR FIX THAT...
