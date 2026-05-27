import { useEffect } from "react";

import {
  FormDialog,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useRoleModalStore } from "../hooks/useRoleModalStore";
import { useRoleMutations } from "../queries";
import type { Role } from "../types";

import RoleForm, { useRoleForm } from "./RoleForm";

interface RoleCreateModalProps {
  /**
   * When provided, switches to controlled mode — open state and the pre-filled
   * name are driven by the caller (RoleCombobox inline-create). In uncontrolled
   * mode these are omitted and the modal is driven by useRoleModalStore instead.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultName?: string;
  /** Called after the role is successfully created. */
  onCreated?: (role: Role) => void;
}

const RoleCreateModal = ({
  open: openProp,
  onOpenChange: onOpenChangeProp,
  defaultName,
  onCreated,
}: RoleCreateModalProps = {}) => {
  const isCreateOpen = useRoleModalStore((s) => s.isCreateOpen);
  const closeAll = useRoleModalStore((s) => s.closeAll);
  const isCreateMore = useRoleModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useRoleModalStore((s) => s.setIsCreateMore);
  const { eventId } = useAdminStore();
  const { create } = useRoleMutations();

  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : isCreateOpen;
  const handleOpenChange = isControlled
    ? (v: boolean) => onOpenChangeProp?.(v)
    : closeAll;

  const form = useRoleForm({
    defaultValues: defaultName ? { name: defaultName } : undefined,
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

  useEffect(() => {
    if (create.isSuccess && create.data && onCreated) {
      onCreated(create.data as Role);
    }
  }, [create.isSuccess]);

  return (
    <FormDialog
      form={form}
      open={open}
      onOpenChange={handleOpenChange}
      isPending={create.isPending}
      isSuccess={create.isSuccess}
      isError={create.isError}
      closeDelay={isControlled ? false : isCreateMore ? false : 300}
      resetOnSuccess={!isControlled && isCreateMore}
    >
      <FormDialogHeader
        title="Add role"
        description="Define a new role for your event team."
      />

      <RoleForm />

      <FormDialogFooter
        onCancel={() => handleOpenChange(false)}
        submitLabel="Add role"
        {...(!isControlled && {
          createMore: { checked: isCreateMore, onChange: setIsCreateMore },
        })}
      />
    </FormDialog>
  );
};

export default RoleCreateModal;
