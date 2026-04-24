import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations } from "../queries";
import type { InviteMemberValues } from "../types";

import MemberForm from "./MemberForm";

const MemberInviteModal = () => {
  const isInviteOpen = useMemberModalStore((s) => s.isInviteOpen);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { invite } = useMemberMutations();

  const handleSubmit = (values: InviteMemberValues) => {
    invite.mutate({
      event_id: eventId!,
      display_name: values.display_name,
      email: values.email,
      role_id: values.role_id,
    });
  };

  return (
    <Dialog open={isInviteOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Send an invitation to join this event.
          </DialogDescription>
        </DialogHeader>
        <MemberForm
          onSubmit={handleSubmit}
          onCancel={closeAll}
          isPending={invite.isPending}
          submitLabel="Send invite"
        />
      </DialogContent>
    </Dialog>
  );
};

export default MemberInviteModal;
