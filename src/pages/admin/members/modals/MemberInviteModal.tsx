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

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations } from "../queries";

import MemberForm, { useMemberInviteForm } from "./MemberForm";

const MemberInviteModal = () => {
  const isInviteOpen = useMemberModalStore((s) => s.isCreateOpen);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const isCreateMore = useMemberModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useMemberModalStore((s) => s.setIsCreateMore);
  const { eventId } = useAdminStore();
  const { invite } = useMemberMutations();

  const form = useMemberInviteForm({
    onSubmit: (values) => {
      invite.mutate({
        event_id: eventId!,
        display_name: values.display_name,
        email: values.email,
        role_id: values.role_id,
      });
    },
  });

  return (
    <FormDialog
      form={form}
      open={isInviteOpen}
      onOpenChange={closeAll}
      isPending={invite.isPending}
      isSuccess={invite.isSuccess}
      isError={invite.isError}
      closeDelay={isCreateMore ? false : 300}
      resetOnSuccess={isCreateMore}
    >
      <DialogHeader>
        <DialogTitle>Invite member</DialogTitle>
        <DialogDescription>
          Send an invitation to join this event.
        </DialogDescription>
      </DialogHeader>

      <MemberForm mode="invite" />

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
            Invite more
          </Label>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={closeAll}>
            Cancel
          </Button>
          <SubmitButton>Send invite</SubmitButton>
        </div>
      </DialogFooter>
    </FormDialog>
  );
};

export default MemberInviteModal;
