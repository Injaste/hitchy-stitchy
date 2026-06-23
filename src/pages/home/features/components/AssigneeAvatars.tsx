import type { FC } from "react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";

import { getInitials } from "../utils";
import type { Member } from "../types";

interface AssigneeAvatarsProps {
  members: Member[];
  selfId?: string | null;
  max?: number;
  className?: string;
}

const RING_CARD =
  "*:data-[slot=avatar]:ring-card *:data-[slot=avatar-group-count]:ring-card";

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
