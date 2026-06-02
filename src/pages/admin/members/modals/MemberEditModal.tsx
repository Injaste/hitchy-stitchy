import {
  FormDialog,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/custom/form";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations, useMembersQuery } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { getMemberRank } from "../../utils/memberUtils";

import MemberForm, { useMemberEditForm } from "./MemberForm";

const MemberEditModal = () => {
  const isEditOpen = useMemberModalStore((s) => s.isEditOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const { eventId, isSuperAdmin } = useAdminStore();
  const { update, updateAccessGroup, updateCouple } = useMemberMutations();
  const { data: members = [] } = useMembersQuery();

  // Hierarchy: access group field is editable only when caller strictly outranks target.
  const callerRank = isSuperAdmin ? 0 : 2;
  const targetRank = selectedItem ? getMemberRank(selectedItem) : 2;
  const callerOutranks = callerRank < targetRank;
  // Detect which couple slots are already held by someone other than the current target.
  const existingBride = members.find(
    (m) => m.is_bride && m.id !== selectedItem?.id,
  );
  const existingGroom = members.find(
    (m) => m.is_groom && m.id !== selectedItem?.id,
  );

  // Hide if both slots are already held by other members — both switches would be disabled.
  const showCoupleRole = isSuperAdmin && !(existingBride && existingGroom);

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
      // Always update display_name / role / notes.
      update.mutate({
        event_id: eventId!,
        id: selectedItem.id,
        display_name: values.display_name,
        role: values.role ?? null,
        notes: values.notes ?? null,
      });
      // Access group change: only if caller outranks target and it actually changed.
      if (callerOutranks && values.access_group_id !== selectedItem.access_group_id) {
        updateAccessGroup.mutate({
          event_id: eventId!,
          id: selectedItem.id,
          access_group_id: values.access_group_id,
        });
      }
      // Couple change: only if caller has couple-role permission and value changed.
      if (showCoupleRole && values.couple_role !== currentCoupleRole) {
        updateCouple.mutate({
          event_id: eventId!,
          id: selectedItem.id,
          is_bride: values.couple_role === "bride",
          is_groom: values.couple_role === "groom",
        });
      }
    },
  });

  if (!selectedItem) return null;

  // Lock access group if target is root OR caller doesn't outrank target (incl. self).
  const lockAccessGroup = selectedItem.is_root || !callerOutranks;
  const canSeeEmail = isSuperAdmin;

  return (
    <FormDialog
      form={form}
      open={isEditOpen}
      onOpenChange={closeAll}
      isPending={
        update.isPending || updateAccessGroup.isPending || updateCouple.isPending
      }
      isSuccess={update.isSuccess}
      isError={update.isError || updateAccessGroup.isError || updateCouple.isError}
    >
      <FormDialogHeader title="Edit member" />

      <MemberForm
        mode="edit"
        showAccessGroup={isSuperAdmin}
        lockAccessGroup={lockAccessGroup}
        email={canSeeEmail ? selectedItem.email : undefined}
        accessGroupInitialName={selectedItem.accessGroup?.name ?? undefined}
        showCoupleRole={showCoupleRole}
        brideTakenBy={existingBride?.display_name ?? null}
        groomTakenBy={existingGroom?.display_name ?? null}
      />

      <FormDialogFooter onCancel={closeAll} submitLabel="Save changes" />
    </FormDialog>
  );
};

export default MemberEditModal;
