import { useEffect, useMemo } from "react";
import { Users } from "lucide-react";

import {
  FormDialog,
  FormFooter,
  FormHeader,
} from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations, useMembersQuery } from "../queries";
import { useAccessGroupsQuery } from "../../access/queries";

import MemberForm, { useMemberForm } from "./MemberForm";

const MemberCreateModal = () => {
  const isCreateOpen = useMemberModalStore((s) => s.isCreateOpen);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const isCreateMore = useMemberModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useMemberModalStore((s) => s.setIsCreateMore);
  const openDetailForCreated = useMemberModalStore((s) => s.openDetailForCreated);
  const { eventId } = useAdminStore();
  const { create } = useMemberMutations();
  const { data: members = [] } = useMembersQuery();

  // Roles held by the couple — reserved from everyone else.
  const reservedRoles = members
    .filter((m) => m.is_bride || m.is_groom)
    .map((m) => m.role)
    .filter((r): r is string => !!r);

  // New members default to the Team group.
  const { data: accessGroups = [] } = useAccessGroupsQuery();
  const teamId = useMemo(
    () => accessGroups.find((g) => g.name === "Team")?.id ?? "",
    [accessGroups],
  );

  const form = useMemberForm({
    reservedRoles,
    defaultValues: { access_group_id: teamId },
    onSubmit: async (values) => {
      // Freeze the hand-off intent at submit time: a later "Invite more" toggle
      // must not change what an already-submitted create does.
      const handOff = !isCreateMore;
      try {
        const member = await create.mutateAsync({
          event_id: eventId!,
          display_name: values.display_name,
          access_group_id: values.access_group_id,
          role: values.role ?? null,
          notes: values.notes ?? null,
          couple: values.couple_role,
        });
        // Single create → hand off to the new member's detail panel (share
        // link). With "Invite more" ON we stay put and the form clears for
        // rapid entry (resetOnSuccess).
        if (handOff) openDetailForCreated(member);
      } catch {
        // Error toast is surfaced by the mutation hook; nothing to do here.
      }
    },
  });

  // Seed the Team default once groups load / whenever the modal reopens empty.
  useEffect(() => {
    if (isCreateOpen && teamId && !form.getFieldValue("access_group_id")) {
      form.setFieldValue("access_group_id", teamId);
    }
  }, [isCreateOpen, teamId, form]);

  // Reset the mutation when the modal closes so a stale success state never
  // carries into the next open. Depend on the stable `reset` fn.
  const resetCreate = create.reset;
  useEffect(() => {
    if (!isCreateOpen) resetCreate();
  }, [isCreateOpen, resetCreate]);

  return (
    <FormDialog
      form={form}
      open={isCreateOpen}
      onOpenChange={closeAll}
      isPending={create.isPending}
      isSuccess={create.isSuccess}
      isError={create.isError}
      closeDelay={false}
      resetOnSuccess={isCreateMore}
    >
      <FormHeader icon={<Users className="size-4" />} title="Invite member" />

      <MemberForm />

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

export default MemberCreateModal;
