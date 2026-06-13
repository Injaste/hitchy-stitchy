import { useStore } from "@tanstack/react-form";
import { Users } from "lucide-react";

import {
  FormDialog,
  FormFooter,
  FormHeader,
} from "@/components/custom/form";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations, useMembersQuery } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useAccess } from "../../hooks/useAccess";

import MemberForm, { useMemberForm } from "./MemberForm";

const MemberEditModal = () => {
  const isEditOpen = useMemberModalStore((s) => s.isEditOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { canManageMembers, canManageCouple, guardChangeAccessGroup } = useAccess();
  const { update, updateAccessGroup, updateCouple } = useMemberMutations();
  const { data: members = [] } = useMembersQuery();

  // Roles held by the couple (other than this target) — reserved from everyone else.
  const reservedRoles = members
    .filter((m) => (m.is_bride || m.is_groom) && m.id !== selectedItem?.id)
    .map((m) => m.role)
    .filter((r): r is string => !!r);
  // Lock the access group against the member AS the couple toggle will leave them:
  // demoting a couple member lifts the super-admin protection, so their group
  // becomes editable. Defined before the form so onSubmit can reuse it.
  const accessLockFor = (couple: "bride" | "groom" | null) =>
    selectedItem
      ? !guardChangeAccessGroup({
          ...selectedItem,
          is_bride: couple === "bride",
          is_groom: couple === "groom",
        })
      : true;

  const currentCoupleRole = selectedItem
    ? selectedItem.is_bride
      ? "bride"
      : selectedItem.is_groom
        ? "groom"
        : null
    : null;

  const form = useMemberForm({
    reservedRoles,
    defaultValues: selectedItem
      ? {
          display_name: selectedItem.display_name,
          access_group_id: selectedItem.access_group_id ?? "",
          role: selectedItem.role ?? "",
          notes: selectedItem.notes ?? "",
          couple_role: currentCoupleRole,
        }
      : undefined,
    onSubmit: (values) => {
      if (!selectedItem) return;

      // Only fire (and toast) the mutations whose fields actually changed.
      const memberChanged =
        values.display_name !== selectedItem.display_name ||
        (values.role ?? null) !== (selectedItem.role ?? null) ||
        (values.notes ?? null) !== (selectedItem.notes ?? null);
      const accessChanged =
        !accessLockFor(values.couple_role) &&
        values.access_group_id !== selectedItem.access_group_id;
      const coupleChanged =
        canManageCouple && values.couple_role !== currentCoupleRole;

      if (memberChanged) {
        update.mutate({
          event_id: eventId!,
          id: selectedItem.id,
          display_name: values.display_name,
          role: values.role ?? null,
          notes: values.notes ?? null,
        });
      }
      if (accessChanged) {
        updateAccessGroup.mutate({
          event_id: eventId!,
          id: selectedItem.id,
          access_group_id: values.access_group_id,
        });
      }
      if (coupleChanged) {
        updateCouple.mutate({
          event_id: eventId!,
          id: selectedItem.id,
          couple: values.couple_role,
        });
      }

      // Nothing changed — just close, no mutation/toast.
      if (!memberChanged && !accessChanged && !coupleChanged) closeAll();
    },
  });

  // Reactive lock for the field — follows the live couple toggle, so demoting
  // enables the access selector immediately (not just on submit).
  const liveCoupleRole = useStore(
    form.store,
    (s: any) => s.values.couple_role,
  ) as "bride" | "groom" | null;
  const lockAccessGroup = accessLockFor(liveCoupleRole);

  if (!selectedItem) return null;

  return (
    <FormDialog
      form={form}
      open={isEditOpen}
      onOpenChange={closeAll}
      isPending={
        update.isPending || updateAccessGroup.isPending || updateCouple.isPending
      }
      isSuccess={update.isSuccess || updateAccessGroup.isSuccess || updateCouple.isSuccess}
      isError={update.isError || updateAccessGroup.isError || updateCouple.isError}
    >
      <FormHeader icon={<Users className="size-4" />} title="Edit member" />

      <MemberForm
        showAccessGroup={canManageMembers}
        lockAccessGroup={lockAccessGroup}
        accessGroupInitialName={selectedItem.accessGroup?.name ?? undefined}
        currentMemberId={selectedItem.id}
        isRoot={selectedItem.is_root}
      />

      <FormFooter onCancel={closeAll} submitLabel="Save changes" />
    </FormDialog>
  );
};

export default MemberEditModal;
