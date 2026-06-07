import type { FC } from "react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { getInitials } from "@/pages/admin/members/utils";

interface AssigneeStackProps {
  ids: string[];
  /** Render side by side up to this count; beyond it, overlap + show +N. */
  max?: number;
  className?: string;
}

/**
 * Avatar row for a set of assignees. Resolves member ids through the shared
 * members cache (ids that don't resolve — e.g. removed members — are skipped)
 * and hands the avatars to AvatarGroup, which renders them side by side while
 * there are `max` or fewer and overlaps + collapses to +N beyond that. Cards
 * sit on `bg-card`, so the overlap ring is retinted to `ring-card`.
 */
const AssigneeStack: FC<AssigneeStackProps> = ({ ids, max = 5, className }) => {
  const { data: members = [] } = useMembersQuery();
  if (ids.length === 0) return null;

  const found = ids
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);
  if (found.length === 0) return null;

  return (
    <AvatarGroup
      max={max}
      className={cn(
        "*:data-[slot=avatar]:ring-card *:data-[slot=avatar-group-count]:ring-card",
        className,
      )}
    >
      {found.map((m) => (
        <Avatar key={m.id} size="sm" title={m.display_name}>
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getInitials(m.display_name)}
          </AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  );
};

export default AssigneeStack;
