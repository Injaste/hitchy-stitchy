import type { FC } from "react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { getInitials } from "@/pages/admin/members/utils";
import type { Member } from "@/pages/admin/members/types";

interface AssigneeAvatarsProps {
  /** Already-resolved members (the container resolves ids → members). */
  members: Member[];
  /** The current user's member id — their avatar is tinted secondary (sage). */
  selfId?: string | null;
  /** Render side by side up to this count; beyond it, overlap + show +N. */
  max?: number;
  className?: string;
}

// Card surface ring retint, shared by the group in both layouts.
const RING_CARD =
  "*:data-[slot=avatar]:ring-card *:data-[slot=avatar-group-count]:ring-card";

/**
 * Pure avatar row for a set of (already-resolved) assignees — no data wiring.
 * The logged-in user's own avatar is tinted secondary (sage green); everyone
 * else is primary. Once the row would overflow, "you" is pulled out of the
 * group and rendered beside it so it never gets swallowed into the +N count.
 * AssigneeStack resolves ids through the members cache and delegates here; the
 * marketing showcase passes sample members directly (no query).
 */
const AssigneeAvatars: FC<AssigneeAvatarsProps> = ({
  members,
  selfId,
  max = 5,
  className,
}) => {
  if (members.length === 0) return null;

  const renderAvatar = (m: Member) => (
    <Avatar key={m.id} size="sm" title={m.display_name}>
      <AvatarFallback
        className={cn(
          "font-semibold",
          m.id === selfId
            ? "bg-secondary/10 text-secondary"
            : "bg-primary/10 text-primary",
        )}
      >
        {getInitials(m.display_name)}
      </AvatarFallback>
    </Avatar>
  );

  const me = selfId ? members.find((m) => m.id === selfId) : undefined;

  // Only break "you" out once the row overflows; within `max` everything is
  // already side by side and visible, so the plain group is enough.
  if (me && members.length > max) {
    const others = members.filter((m) => m.id !== selfId);
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
      {members.map(renderAvatar)}
    </AvatarGroup>
  );
};

export default AssigneeAvatars;
