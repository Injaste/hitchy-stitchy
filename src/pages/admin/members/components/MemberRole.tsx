import type { FC } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { Member } from "../types";

interface MemberRoleProps {
  member: Member;
  isSelf: boolean;
  className?: string;
}

/** Role badge shown next to a member's name — superadmins get the solid variant. */
const MemberRole: FC<MemberRoleProps> = ({ member, isSelf, className }) => {
  if (!member.role) return null;

  return (
    <Badge
      variant={isSelf ? "secondary" : "default"}
      className={cn("text-2xs tracking-wide shrink-0", className)}
    >
      {member.role}
    </Badge>
  );
};

export default MemberRole;
