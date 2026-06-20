import { AvatarField } from "@/components/custom/form";

import AccountAvatar from "./AccountAvatar";
import { useProfileQuery, useUpdateAvatarMutation } from "../queries";

/** Wires the presentational AvatarField to the account profile: supplies the
 *  avatar preview and the upload mutation (which owns the success/error toast).
 *  The avatar is global (one per account), so this same widget is reused across
 *  every event's settings. */
const AvatarUploader = () => {
  const { data: profile } = useProfileQuery();
  const { mutate: upload, isPending } = useUpdateAvatarMutation();

  return (
    <AvatarField
      className="justify-center md:justify-start"
      isPending={isPending}
      onSelectFile={upload}
      preview={
        <AccountAvatar
          name={profile?.name}
          avatarUrl={profile?.avatar_url}
          className="size-16"
        />
      }
    />
  );
};

export default AvatarUploader;
