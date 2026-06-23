import type { FC } from "react";

import { cn } from "@/lib/utils";

import type { Member } from "../types";
import { getInitials } from "../utils";

interface MemberAvatarProps {
  member: Member;
  className?: string;
}

const MemberAvatar: FC<MemberAvatarProps> = ({ member, className }) => (
  <div
    className={cn(
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide",
      className,
    )}
  >
    {getInitials(member.display_name)}
  </div>
);

export default MemberAvatar;
