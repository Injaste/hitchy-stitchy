import type { FC } from "react";
import type { VariantProps } from "class-variance-authority";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useMembersQuery } from "../queries";
import { useMemberModalStore } from "../hooks/useMemberModalStore";

interface MemberBadgeProps {
  memberId: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
  className?: string;
}

const MemberBadge: FC<MemberBadgeProps> = ({
  memberId,
  variant = "outline",
  className,
}) => {
  const { data: members = [] } = useMembersQuery();
  const openDetail = useMemberModalStore((s) => s.openDetail);

  const member = members.find((m) => m.id === memberId);

  return (
    <Badge
      asChild
      variant={variant}
      className={cn(
        "relative z-10 text-xs font-normal transition-colors",
        member &&
          "cursor-pointer hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20",
        className,
      )}
    >
      <button
        type="button"
        disabled={!member}
        onClick={(e) => {
          e.stopPropagation();
          if (member) openDetail(member);
        }}
      >
        {member?.display_name ?? "Unknown"}
      </button>
    </Badge>
  );
};

export default MemberBadge;
