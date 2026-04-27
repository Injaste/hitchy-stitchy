import type { FC } from "react";
import { Snowflake } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import type { Member } from "../types";

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

  const isRejected = !!member.rejected_at;
  const isFrozen = member.is_frozen;
  const isPending = !member.joined_at && !isRejected;

  const statusLabel = isRejected
    ? `Declined`
    : isFrozen
      ? "Frozen"
      : isPending
        ? "Pending"
        : null;

  return (
    <Button variant="card" size="free" onClick={() => openDetail(member)}>
      <Card
        className={cn(
          "cursor-pointer h-full",
          isFrozen && "opacity-60",
          isRejected && "opacity-40",
        )}
      >
        <CardContent className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground shrink-0">
              {getInitials(member.display_name) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-display text-base text-foreground truncate",
                  isRejected && "line-through text-muted-foreground",
                )}
              >
                {member.display_name}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-2xs tracking-wide",
                isRejected && "opacity-50",
              )}
            >
              {member.role.short_name} · {member.role.name}
            </Badge>

            {statusLabel && (
              <span
                className={cn(
                  "flex items-center gap-1 text-xs text-muted-foreground",
                  (isRejected || isFrozen) && "text-destructive/60 italic",
                )}
              >
                {isFrozen && <Snowflake className="w-3 h-3" />}
                {statusLabel}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Button>
  );
};

export default MemberCard;
