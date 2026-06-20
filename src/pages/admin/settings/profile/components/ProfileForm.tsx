import { CircleUser } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NameField } from "@/components/custom/form";

import AvatarUploader from "@/pages/account/components/AvatarUploader";
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

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <CircleUser className="size-4" />
          <span className="text-sm font-medium">Profile</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Avatar is account-global (one across every event); the display name
            below is per-event. Both auto-save — no Save button. */}
        <AvatarUploader />

        <NameField
          id="display-name"
          label="Display name"
          saved={member.display_name}
          minLength={1}
          maxLength={80}
          onSave={handleNameSave}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
