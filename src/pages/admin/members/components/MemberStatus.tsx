import { CheckCircle2, Clock, Snowflake, UserX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Member, type MemberStatusLabel } from "../types";
import { getMemberStatus } from "../utils";

interface MemberStatusProps {
  member: Pick<Member, "joined_at" | "rejected_at" | "is_frozen">;
  className?: string;
}

const MemberStatus = ({ member, className }: MemberStatusProps) => {
  const config: Record<
    MemberStatusLabel,
    { icon: LucideIcon; label: string; className: string }
  > = {
    active: { icon: CheckCircle2, label: "Active", className: "text-primary" },
    pending: {
      icon: Clock,
      label: "Pending invite",
      className: "text-muted-foreground",
    },
    frozen: {
      icon: Snowflake,
      label: "Frozen",
      className: "text-muted-foreground",
    },
    rejected: {
      icon: UserX,
      label: "Declined",
      className: "text-destructive/60",
    },
  };

  const {
    icon: Icon,
    label,
    className: colorClass,
  } = config[getMemberStatus(member)];

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-sm font-medium",
        colorClass,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" /> {label}
    </span>
  );
};

export default MemberStatus;
