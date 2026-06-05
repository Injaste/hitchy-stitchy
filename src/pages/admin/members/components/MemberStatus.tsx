import { cn } from "@/lib/utils";
import type { Member } from "../types";
import { getMemberStatus, MEMBER_STATUS_CONFIG } from "../utils";

interface MemberStatusProps {
  member: Pick<Member, "joined_at" | "rejected_at" | "frozen_at">;
  className?: string;
}

const MemberStatus = ({ member, className }: MemberStatusProps) => {
  const { icon: Icon, label, className: colorClass } =
    MEMBER_STATUS_CONFIG[getMemberStatus(member)];

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-sm font-medium",
        colorClass,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
};

export default MemberStatus;
