import type { FC } from "react";
import { User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

interface AccountAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
}

/** The account's global avatar: uploaded image when present, else initials, else
 *  a neutral icon (older accounts with no name yet). Shared by the menu trigger
 *  and the settings uploader so the initials rule stays in one place. */
const AccountAvatar: FC<AccountAvatarProps> = ({
  name,
  avatarUrl,
  size = "default",
  className,
}) => (
  <Avatar size={size} className={className}>
    {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? "Your avatar"} />}
    <AvatarFallback>
      {name ? getInitials(name) : <User className="size-1/2" />}
    </AvatarFallback>
  </Avatar>
);

export default AccountAvatar;
