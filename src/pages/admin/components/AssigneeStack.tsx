import type { FC } from "react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { useMembersQuery } from "@/pages/admin/members/queries";
import { getInitials } from "@/pages/admin/members/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import type { Member } from "@/pages/admin/members/types";

interface AssigneeStackProps {
  ids: string[];
  /** Render side by side up to this count; beyond it, overlap + show +N. */
  max?: number;
  className?: string;
}

// Card surface ring retint, shared by the group in both layouts.
const RING_CARD =
  "*:data-[slot=avatar]:ring-card *:data-[slot=avatar-group-count]:ring-card";

/**
 * Avatar row for a set of assignees. Resolves member ids through the shared
 * members cache (ids that don't resolve — e.g. removed members — are skipped)
 * and hands the avatars to AvatarGroup, which renders them side by side while
 * there are `max` or fewer and overlaps + collapses to +N beyond that. Cards
 * sit on `bg-card`, so the overlap ring is retinted to `ring-card`.
 *
 * The logged-in user's own avatar is tinted secondary, and once the row would
 * overflow it is pulled out of the group and rendered beside it — so "you" is
 * never swallowed into the +N count and stays easy to spot.
 */
const AssigneeStack: FC<AssigneeStackProps> = ({ ids, max = 5, className }) => {
  const { data: members = [] } = useMembersQuery();
  const memberId = useAdminStore((s) => s.memberId);
  if (ids.length === 0) return null;

  const found = ids
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);
  if (found.length === 0) return null;

  const renderAvatar = (m: Member) => (
    <Avatar key={m.id} size="sm" title={m.display_name}>
      <AvatarFallback
        className={cn(
          "font-semibold",
          m.id === memberId
            ? "bg-secondary/10 text-secondary"
            : "bg-primary/10 text-primary",
        )}
      >
        {getInitials(m.display_name)}
      </AvatarFallback>
    </Avatar>
  );

  const me = memberId ? found.find((m) => m.id === memberId) : undefined;

  // Only break "you" out once the row overflows; within `max` everything is
  // already side by side and visible, so the plain group is enough.
  if (me && found.length > max) {
    const others = found.filter((m) => m.id !== memberId);
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {renderAvatar(me)}
        <AvatarGroup max={max} className={RING_CARD}>
          {others.map(renderAvatar)}
        </AvatarGroup>
      </div>
    );
  }

  return (
    <AvatarGroup max={max} className={cn(RING_CARD, className)}>
      {found.map(renderAvatar)}
    </AvatarGroup>
  );
};

export default AssigneeStack;
