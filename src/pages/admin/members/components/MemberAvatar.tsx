import type { FC } from "react";

import { cn } from "@/lib/utils";
import MemberCrown from "@/pages/admin/components/MemberCrown";

import type { Member } from "../types";
import { getInitials } from "../utils";

interface MemberAvatarProps {
  member: Member;
  className?: string;
}

/** Round initials bubble for a member. Defaults to h-9/w-9; pass className to resize. */
const MemberAvatar: FC<MemberAvatarProps> = ({ member, className }) => (
  <div className="relative shrink-0">
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide",
        className,
      )}
    >
      {getInitials(member.display_name)}
    </div>
    <MemberCrown
      isBride={member.is_bride}
      isGroom={member.is_groom}
      className="-top-1.5 -left-0.5 size-4"
    />
  </div>
);

export default MemberAvatar;
