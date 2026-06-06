import type { FC } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { isSuperAdminMember } from "../../utils/memberUtils";
import type { Member } from "../types";

interface MemberRoleProps {
  member: Member;
  className?: string;
}

/** Role badge shown next to a member's name — superadmins get the solid variant. */
const MemberRole: FC<MemberRoleProps> = ({ member, className }) => {
  if (!member.role) return null;

  const isSuperAdmin = isSuperAdminMember(member);
  const isRejected = !!member.rejected_at;

  return (
    <Badge
      variant={isSuperAdmin ? "default" : "secondary"}
      className={cn(
        "text-2xs tracking-wide shrink-0",
        isRejected && "opacity-50",
        className,
      )}
    >
      {member.role}
    </Badge>
  );
};

export default MemberRole;
