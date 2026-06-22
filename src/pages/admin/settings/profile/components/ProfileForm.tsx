import { NameField } from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useMemberMutations } from "@/pages/admin/members/queries";
import type { Member } from "@/pages/admin/members/types";

const ProfileForm = ({ member }: { member: Member }) => {
  const { eventId, memberId } = useAdminStore();
  const { update } = useMemberMutations();

  // Reuse the admin update_member RPC on our own row. role/notes are passed
  // unchanged so they aren't nulled out — only the display name changes.
  const handleNameSave = (display_name: string) =>
    update.mutate({
      event_id: eventId,
      id: memberId,
      display_name,
      role: member.role,
      notes: member.notes,
    });

  // Flush (no card) — matches the account Profile section. Per-event identity:
  // how you appear in this event. The account-global name + avatar live in
  // Account settings. Auto-saves, no Save button.
  return (
    <div className="space-y-4">
      <NameField
        id="display-name"
        label="How you appear in this event"
        saved={member.display_name}
        minLength={1}
        maxLength={80}
        onSave={handleNameSave}
      />
    </div>
  );
};

export default ProfileForm;
