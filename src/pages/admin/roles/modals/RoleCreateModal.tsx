import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/custom/form";
import { FormDialog } from "@/components/custom/form";

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
      <DialogHeader>
        <DialogTitle>Add role</DialogTitle>
        <DialogDescription>
          Define a new role for your event team.
        </DialogDescription>
      </DialogHeader>

      <RoleForm />

      <Separator />

      <DialogFooter className="sm:justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="create-more"
            checked={isCreateMore}
            onCheckedChange={setIsCreateMore}
          />
          <Label
            htmlFor="create-more"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Create more
          </Label>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={closeAll}>
            Cancel
          </Button>
          <SubmitButton>Add role</SubmitButton>
        </div>
      </DialogFooter>
    </FormDialog>
  );
};

export default RoleCreateModal;
