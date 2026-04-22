import type { FC } from "react";
import { Snowflake } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import type { Member } from "../types";
import { Button } from "@/components/ui/button";

interface MemberCardProps {
  member: Member;
}

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

const MemberCard: FC<MemberCardProps> = ({ member }) => {
  const openDetail = useMemberModalStore((s) => s.openDetail);

  const isPending = !member.joined_at;
  const isFrozen = member.is_frozen;

  return (
    <Button variant="card" size="free" onClick={() => openDetail(member)}>
      <Card className={cn("cursor-pointer h-full", isFrozen && "opacity-60")}>
        <CardContent className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground shrink-0">
              {getInitials(member.display_name) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-base text-foreground truncate">
                {member.display_name}
              </p>
              {/* <p className="text-xs text-muted-foreground truncate">
                {member.email}
              </p> */}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            {member.role ? (
              <Badge variant="outline" className="text-2xs tracking-wide">
                {member.role.short_name} · {member.role.name}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-2xs text-muted-foreground italic"
              >
                No role
              </Badge>
            )}

            {isFrozen ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Snowflake className="w-3 h-3" />
                Frozen
              </span>
            ) : isPending ? (
              <span className="text-xs text-muted-foreground italic">
                Pending
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Button>
  );
};

export default MemberCard;
