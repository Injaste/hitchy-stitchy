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

import MemberForm, { useMemberEditForm } from "./MemberForm";

const MemberEditModal = () => {
  const isEditOpen = useMemberModalStore((s) => s.isEditOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { canManageMembers, canManageCouple, guardChangeAccessGroup } = useAccess();
  const { update, updateAccessGroup, updateCouple } = useMemberMutations();
  const { data: members = [] } = useMembersQuery();

  // Detect which couple slots are already held by someone other than the current target.
  const existingBride = members.find(
    (m) => m.is_bride && m.id !== selectedItem?.id,
  );
  const existingGroom = members.find(
    (m) => m.is_groom && m.id !== selectedItem?.id,
  );

  // Hide if both slots are already held by other members — both switches would be disabled.
  const showCoupleRole = canManageCouple && !(existingBride && existingGroom);
  // Computed before the form so the onSubmit closure captures the current value.
  const lockAccessGroup = selectedItem ? !guardChangeAccessGroup(selectedItem) : true;

  const currentCoupleRole = selectedItem
    ? selectedItem.is_bride
      ? "bride"
      : selectedItem.is_groom
        ? "groom"
        : null
    : null;

  const form = useMemberEditForm({
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
        !lockAccessGroup && values.access_group_id !== selectedItem.access_group_id;
      const coupleChanged =
        showCoupleRole && values.couple_role !== currentCoupleRole;

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
          is_bride: values.couple_role === "bride",
          is_groom: values.couple_role === "groom",
        });
      }

      // Nothing changed — just close, no mutation/toast.
      if (!memberChanged && !accessChanged && !coupleChanged) closeAll();
    },
  });

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
        mode="edit"
        showAccessGroup={canManageMembers}
        lockAccessGroup={lockAccessGroup}
        accessGroupInitialName={selectedItem.accessGroup?.name ?? undefined}
        showCoupleRole={showCoupleRole}
        brideTakenBy={existingBride?.display_name ?? null}
        groomTakenBy={existingGroom?.display_name ?? null}
        isRoot={selectedItem.is_root}
      />

      <FormFooter onCancel={closeAll} submitLabel="Save changes" />
    </FormDialog>
  );
};

export default MemberEditModal;
