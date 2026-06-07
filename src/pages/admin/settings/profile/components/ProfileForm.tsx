import { useForm } from "@tanstack/react-form";
import { CircleUser } from "lucide-react";

import { FieldGroup } from "@/components/ui/field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  FormCard,
  FormHeader,
  FormBody,
  FormFooter,
  TextField,
} from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useMemberMutations } from "@/pages/admin/members/queries";
import type { Member } from "@/pages/admin/members/types";
import { profileSchema } from "../types";

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const ProfileForm = ({ member }: { member: Member }) => {
  const { eventId, memberId } = useAdminStore();
  const { update } = useMemberMutations();

  const form = useForm({
    defaultValues: { display_name: member.display_name },
    validators: { onSubmit: profileSchema, onChange: profileSchema },
    onSubmit: async ({ value }) => {
      // Reuse the admin update_member RPC on our own row. role/notes are passed
      // unchanged so they aren't nulled out — only display_name is editable here.
      await update.mutateAsync({
        event_id: eventId,
        id: memberId,
        display_name: value.display_name,
        role: member.role,
        notes: member.notes,
      });
    },
  });

  return (
    <FormCard
      form={form}
      isPending={update.isPending}
      isSuccess={update.isSuccess}
      isError={update.isError}
      className="max-w-sm"
    >
      <FormHeader icon={<CircleUser className="size-4" />} title="Profile" />

      <FormBody>
        <FieldGroup>
          {/* Avatar — UI stub only, no upload wiring yet. */}
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="size-16">
              <AvatarFallback>{getInitials(member.display_name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Button type="button" variant="outline" size="sm" disabled>
                Change photo
              </Button>
              <p className="text-xs text-muted-foreground">
                Photo uploads coming soon.
              </p>
            </div>
          </div>

          <TextField
            name="display_name"
            label="Display name"
            placeholder="Your name"
            maxLength={80}
          />
        </FieldGroup>
      </FormBody>

      <FormFooter submitLabel="Save changes" />
    </FormCard>
  );
};

export default ProfileForm;
