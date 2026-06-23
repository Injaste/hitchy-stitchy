import type { FC } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { isSuperAdminMember } from "../utils";
import type { Member } from "../types";

interface MemberRoleProps {
  member: Member;
  className?: string;
}

const MemberRole: FC<MemberRoleProps> = ({ member, className }) => {
  if (!member.role) return null;

  const isSuperAdmin = isSuperAdminMember(member);

  return (
    <Badge
      variant={isSuperAdmin ? "default" : "secondary"}
      className={cn("text-2xs tracking-wide shrink-0", className)}
    >
      {member.role}
    </Badge>
  );
};

export default MemberRole;
