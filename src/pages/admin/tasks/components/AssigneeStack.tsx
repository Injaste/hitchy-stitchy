import type { FC } from "react";

import { cn } from "@/lib/utils";
import { useMembersQuery } from "@/pages/admin/members/queries";
import MemberAvatar from "@/pages/admin/members/components/MemberAvatar";

interface AssigneeStackProps {
  ids: string[];
  max?: number;
  className?: string;
}

/**
 * Overlapping initial-avatar stack for a task's assignees. Resolves member
 * ids through the shared members cache and reuses MemberAvatar; ids that
 * don't resolve (e.g. removed members) are skipped. Shows up to `max`, then
 * a +N overflow chip.
 */
const AssigneeStack: FC<AssigneeStackProps> = ({ ids, max = 3, className }) => {
  const { data: members = [] } = useMembersQuery();
  if (ids.length === 0) return null;

  const found = ids
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);
  if (found.length === 0) return null;

  const shown = found.slice(0, max);
  const extra = found.length - shown.length;

  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((m, i) => (
        <span key={m.id} title={m.display_name} className={cn(i > 0 && "-ml-1.5")}>
          <MemberAvatar member={m} className="size-6 text-2xs ring-2 ring-card" />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="-ml-1.5 flex size-6 items-center justify-center rounded-full bg-muted text-2xs font-semibold text-muted-foreground ring-2 ring-card"
          title={found.slice(max).map((m) => m.display_name).join(", ")}
        >
          +{extra}
        </span>
      )}
    </div>
  );
};

export default AssigneeStack;
