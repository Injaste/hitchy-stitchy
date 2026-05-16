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
import { FormDialog, SubmitButton } from "@/components/custom/form";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";

import GuestForm, { useGuestForm } from "./GuestForm";
import { useInvitationQuery } from "../../invitation/queries";

const GuestCreateModal = () => {
  const isCreateOpen = useGuestModalStore((s) => s.isCreateOpen);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const isCreateMore = useGuestModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useGuestModalStore((s) => s.setIsCreateMore);
  const { create } = useGuestMutations();

  const { data: invitation } = useInvitationQuery();

  const form = useGuestForm({
    onSubmit: (values) => {
      create.mutate({
        name: values.name,
        phone: values.phone,
        guest_count: values.guest_count,
        status: values.status,
        message: values.message,
      });
    },
  });

  if (!invitation) return null;

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
        <DialogTitle>Add guest</DialogTitle>
        <DialogDescription>
          Add a new guest to your list. You can update their RSVP status later.
        </DialogDescription>
      </DialogHeader>

      <GuestForm maxGuest={invitation.guest_count_max} />

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
          <SubmitButton>Add guest</SubmitButton>
        </div>
      </DialogFooter>
    </FormDialog>
  );
};

export default GuestCreateModal;
