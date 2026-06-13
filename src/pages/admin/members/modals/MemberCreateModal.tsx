import { useEffect, useMemo, useRef } from "react";
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
import { useAccess } from "../../hooks/useAccess";

import MemberForm, { useMemberCreateForm } from "./MemberForm";

const MemberCreateModal = () => {
  const isCreateOpen = useMemberModalStore((s) => s.isCreateOpen);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const isCreateMore = useMemberModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useMemberModalStore((s) => s.setIsCreateMore);
  const openDetailForCreated = useMemberModalStore((s) => s.openDetailForCreated);
  const { eventId } = useAdminStore();
  const { canManageCouple } = useAccess();
  const { create } = useMemberMutations();
  const { data: members = [] } = useMembersQuery();

  // Roles held by the couple — reserved from everyone else.
  const reservedRoles = members
    .filter((m) => m.is_bride || m.is_groom)
    .map((m) => m.role)
    .filter((r): r is string => !!r);

  // Couple slots already filled (no self to exclude — this member doesn't exist yet).
  const existingBride = members.find((m) => m.is_bride);
  const existingGroom = members.find((m) => m.is_groom);
  // Same gate as edit: couple permission, and hide once both slots are taken.
  const showCoupleRole = canManageCouple && !(existingBride && existingGroom);

  // New members default to the Team group.
  const { data: accessGroups = [] } = useAccessGroupsQuery();
  const teamId = useMemo(
    () => accessGroups.find((g) => g.name === "Team")?.id ?? "",
    [accessGroups],
  );

  const form = useMemberCreateForm({
    reservedRoles,
    defaultValues: { access_group_id: teamId },
    onSubmit: (values) => {
      create.mutate({
        event_id: eventId!,
        display_name: values.display_name,
        access_group_id: values.access_group_id,
        role: values.role ?? null,
        notes: values.notes ?? null,
        couple: values.couple_role,
      });
    },
  });

  // Seed the Team default once groups load / whenever the modal reopens empty.
  useEffect(() => {
    if (isCreateOpen && teamId && !form.getFieldValue("access_group_id")) {
      form.setFieldValue("access_group_id", teamId);
    }
  }, [isCreateOpen, teamId, form]);

  // Reset the mutation when the modal closes so a stale success never re-triggers
  // the hand-off on the next open. Depend on the stable `reset` fn.
  const resetCreate = create.reset;
  useEffect(() => {
    if (!isCreateOpen) resetCreate();
  }, [isCreateOpen, resetCreate]);

  // After a single create, hand off to the new member's detail panel (which has
  // the share link) instead of an inline success state.
  const handedOff = useRef(false);
  useEffect(() => {
    if (!create.isSuccess) {
      handedOff.current = false;
      return;
    }
    // When "Invite more" is ON we deliberately do NOT open the detail modal —
    // the modal stays open + resets (resetOnSuccess) for rapid entry, and the
    // links stay retrievable from the roster. Hand off only for a single create.
    if (!isCreateMore && create.data && !handedOff.current) {
      handedOff.current = true;
      openDetailForCreated(create.data);
    }
  }, [create.isSuccess, create.data, isCreateMore, openDetailForCreated]);

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

      <MemberForm
        showCoupleRole={showCoupleRole}
        brideTakenBy={existingBride?.display_name ?? null}
        groomTakenBy={existingGroom?.display_name ?? null}
      />

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
