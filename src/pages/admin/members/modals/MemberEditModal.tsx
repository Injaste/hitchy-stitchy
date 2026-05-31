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
  const { eventId, memberId, isSuperAdmin } = useAdminStore();
  const { update, updateRole, updateCouple } = useMemberMutations();
  const { data: members = [] } = useMembersQuery();

  // Hierarchy: role field is editable only when caller strictly outranks target.
  const callerRank = isSuperAdmin ? 0 : 2;
  const targetRank = selectedItem ? getMemberRank(selectedItem) : 2;
  const callerOutranks = callerRank < targetRank;
  const isSelf = selectedItem?.id === memberId;

  // Couple role field visible to root users or members who already hold a couple role.
  const showCoupleRole = isSuperAdmin;

  // Detect which couple slots are already held by someone other than the current target.
  const existingBride = members.find(
    (m) => m.is_bride && m.id !== selectedItem?.id,
  );
  const existingGroom = members.find(
    (m) => m.is_groom && m.id !== selectedItem?.id,
  );

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
          role_id: selectedItem.role_id ?? "",
          label: selectedItem.label ?? "",
          notes: selectedItem.notes ?? "",
          couple_role: currentCoupleRole,
        }
      : undefined,
    onSubmit: (values) => {
      if (!selectedItem) return;
      // Always update display_name / label / notes.
      update.mutate({
        event_id: eventId!,
        id: selectedItem.id,
        display_name: values.display_name,
        label: values.label ?? null,
        notes: values.notes ?? null,
      });
      // Role change: only if caller outranks target and role actually changed.
      if (callerOutranks && values.role_id !== selectedItem.role_id) {
        updateRole.mutate({
          event_id: eventId!,
          id: selectedItem.id,
          role_id: values.role_id,
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

  // Lock role if target is root OR caller doesn't outrank target (incl. self).
  const lockRole = selectedItem.is_root || !callerOutranks;
  const canSeeEmail = isSelf || selectedItem.invited_by === memberId;

  return (
    <FormDialog
      form={form}
      open={isEditOpen}
      onOpenChange={closeAll}
      isPending={
        update.isPending || updateRole.isPending || updateCouple.isPending
      }
      isSuccess={update.isSuccess}
      isError={update.isError || updateRole.isError || updateCouple.isError}
    >
      <FormDialogHeader
        title="Edit member"
        description="Update this member's details or role."
      />

      <MemberForm
        mode="edit"
        showRole={isSuperAdmin}
        lockRole={lockRole}
        email={canSeeEmail ? selectedItem.email : undefined}
        showCoupleRole={showCoupleRole}
        brideTakenBy={existingBride?.display_name ?? null}
        groomTakenBy={existingGroom?.display_name ?? null}
      />

      <FormDialogFooter onCancel={closeAll} submitLabel="Save changes" />
    </FormDialog>
  );
};

export default MemberEditModal;
