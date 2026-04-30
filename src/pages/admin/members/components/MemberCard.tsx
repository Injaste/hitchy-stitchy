import type { FC } from "react";
import { Snowflake } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { type Member } from "../types";
import MemberStatus from "./MemberStatus";
import { getMemberStatus } from "../utils";

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

  const status = getMemberStatus(member);
  const isRejected = status === "rejected";
  const isFrozen = status === "frozen";

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

            {status !== "active" && (
              <MemberStatus member={member} className="text-xs italic" />
            )}
          </div>
        </CardContent>
      </Card>
    </Button>
  );
};

export default MemberCard;
