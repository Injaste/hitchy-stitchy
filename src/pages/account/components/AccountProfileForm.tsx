import { NameField } from "@/components/custom/form";

import AvatarUploader from "./AvatarUploader";
import { useProfileQuery, useUpdateProfileNameMutation } from "../queries";

/** Account identity: avatar + name + email — flush (no card) for the settings
 *  modal. The avatar and name auto-save (no Save button); email is read-only. */
const AccountProfileForm = () => {
  const { data: profile } = useProfileQuery();
  const { mutate: updateName } = useUpdateProfileNameMutation();

  return (
    <div className="space-y-4">
      <AvatarUploader />

      <NameField
        id="account-name"
        label="Name"
        saved={profile?.name ?? ""}
        onSave={updateName}
      />

      <div className="grid gap-1.5">
        <span className="text-sm font-medium">Email</span>
        <p className="truncate text-sm text-muted-foreground">
          {profile?.email ?? "—"}
        </p>
      </div>
    </div>
  );
};

export default AccountProfileForm;
