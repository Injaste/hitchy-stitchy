import { useEffect, useMemo, useRef } from "react";
import { Users } from "lucide-react";

import {
  FormDialog,
  FormFooter,
  FormHeader,
} from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations } from "../queries";
import { useAccessGroupsQuery } from "../../access/queries";

import MemberForm, { useMemberInviteForm } from "./MemberForm";

const MemberInviteModal = () => {
  const isInviteOpen = useMemberModalStore((s) => s.isCreateOpen);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const isCreateMore = useMemberModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useMemberModalStore((s) => s.setIsCreateMore);
  const openDetailForInvited = useMemberModalStore((s) => s.openDetailForInvited);
  const { eventId } = useAdminStore();
  const { invite } = useMemberMutations();

  // New invites default to the Team group.
  const { data: accessGroups = [] } = useAccessGroupsQuery();
  const teamId = useMemo(
    () => accessGroups.find((g) => g.name === "Team")?.id ?? "",
    [accessGroups],
  );

  const form = useMemberInviteForm({
    defaultValues: { access_group_id: teamId },
    onSubmit: (values) => {
      invite.mutate({
        event_id: eventId!,
        display_name: values.display_name,
        access_group_id: values.access_group_id,
        role: values.role ?? null,
        notes: values.notes ?? null,
      });
    },
  });

  // Seed the Team default once groups load / whenever the modal reopens empty.
  useEffect(() => {
    if (isInviteOpen && teamId && !form.getFieldValue("access_group_id")) {
      form.setFieldValue("access_group_id", teamId);
    }
  }, [isInviteOpen, teamId, form]);

  // Reset the mutation when the modal closes so a stale success never re-triggers
  // the hand-off on the next open. Depend on the stable `reset` fn.
  const resetInvite = invite.reset;
  useEffect(() => {
    if (!isInviteOpen) resetInvite();
  }, [isInviteOpen, resetInvite]);

  // After a single invite, hand off to the new member's detail panel (which has
  // the share link) instead of an inline success state.
  const handedOff = useRef(false);
  useEffect(() => {
    if (!invite.isSuccess) {
      handedOff.current = false;
      return;
    }
    // When "Invite more" is ON we deliberately do NOT open the detail modal —
    // the modal stays open + resets (resetOnSuccess) for rapid entry, and the
    // links stay retrievable from the roster. Hand off only for a single invite.
    if (!isCreateMore && invite.data && !handedOff.current) {
      handedOff.current = true;
      openDetailForInvited(invite.data);
    }
  }, [invite.isSuccess, invite.data, isCreateMore, openDetailForInvited]);

  return (
    <FormDialog
      form={form}
      open={isInviteOpen}
      onOpenChange={closeAll}
      isPending={invite.isPending}
      isSuccess={invite.isSuccess}
      isError={invite.isError}
      closeDelay={false}
      resetOnSuccess={isCreateMore}
    >
      <FormHeader icon={<Users className="size-4" />} title="Invite member" />

      <MemberForm mode="invite" />

      <FormFooter
        onCancel={closeAll}
        submitLabel="Send invite"
        createMore={{
          checked: isCreateMore,
          onChange: setIsCreateMore,
          label: "Invite more",
        }}
      />
    </FormDialog>
  );
};

export default MemberInviteModal;
