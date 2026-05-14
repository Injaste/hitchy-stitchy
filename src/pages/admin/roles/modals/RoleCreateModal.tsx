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

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useRoleModalStore } from "../hooks/useRoleModalStore";
import { useRoleMutations } from "../queries";

import RoleForm, { useRoleForm } from "./RoleForm";

const RoleCreateModal = () => {
  const isCreateOpen = useRoleModalStore((s) => s.isCreateOpen);
  const closeAll = useRoleModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { create } = useRoleMutations();

  const form = useRoleForm({
    onSubmit: (values) => {
      create.mutate({
        event_id: eventId!,
        name: values.name,
        short_name: values.short_name,
        category: values.category,
        description: values.description,
      });
    },
  });

  return (
    <FormDialog
      form={form}
      open={isCreateOpen}
      onOpenChange={closeAll}
      isPending={create.isPending}
    >
      <DialogHeader>
        <DialogTitle>Add role</DialogTitle>
        <DialogDescription>
          Define a new role for your event team.
        </DialogDescription>
      </DialogHeader>

      <RoleForm />

      <Separator />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={closeAll}>
          Cancel
        </Button>
        <SubmitButton pendingLabel="Adding">Add role</SubmitButton>
      </DialogFooter>
    </FormDialog>
  );
};

export default RoleCreateModal;
