import {
  FormDialog,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useRoleModalStore } from "../hooks/useRoleModalStore";
import { useRoleMutations } from "../queries";

import RoleForm, { useRoleForm } from "./RoleForm";

const RoleCreateModal = () => {
  const isCreateOpen = useRoleModalStore((s) => s.isCreateOpen);
  const closeAll = useRoleModalStore((s) => s.closeAll);
  const isCreateMore = useRoleModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useRoleModalStore((s) => s.setIsCreateMore);
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
      isSuccess={create.isSuccess}
      isError={create.isError}
      closeDelay={isCreateMore ? false : 300}
      resetOnSuccess={isCreateMore}
    >
      <FormDialogHeader
        title="Add role"
        description="Define a new role for your event team."
      />

      <RoleForm />

      <FormDialogFooter
        onCancel={closeAll}
        submitLabel="Add role"
        createMore={{ checked: isCreateMore, onChange: setIsCreateMore }}
      />
    </FormDialog>
  );
};

export default RoleCreateModal;
