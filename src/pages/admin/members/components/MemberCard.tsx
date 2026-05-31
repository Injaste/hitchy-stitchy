import type { FC } from "react";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import NotesMarkdown from "@/components/custom/notes-markdown";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { type Member } from "../types";
import MemberStatus from "./MemberStatus";
import { getMemberStatus } from "../utils";

interface MemberCardProps {
  member: Member;
}

/** Derive 1–2 initials from a display name. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const MemberCard: FC<MemberCardProps> = ({ member }) => {
  const openDetail = useMemberModalStore((s) => s.openDetail);

  const status = getMemberStatus(member);
  const isRejected = status === "rejected";
  const isFrozen = status === "frozen";

  const isCouple = member.is_bride || member.is_groom;

  return (
    <Card
      variant="interactive"
      className={cn(
        "relative border-l-4",
        isCouple ? "border-l-primary" : "border-l-accent",
        isFrozen && "opacity-60",
        isRejected && "opacity-40",
      )}
    >
      <button
        onClick={() => openDetail(member)}
        aria-label={member.display_name}
        className="absolute inset-0 rounded-[inherit] z-0 cursor-pointer"
      />
      <CardContent>
        <div className="flex gap-4 sm:gap-8">
          <div className="flex gap-3 flex-1 min-w-0">
            {/* Name-initials bubble */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              {getInitials(member.display_name)}
            </div>

            {/* Content */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <p
                  className={cn(
                    "font-display text-sm font-medium text-foreground truncate",
                    isRejected && "line-through text-muted-foreground",
                  )}
                >
                  {member.display_name}
                </p>

                {/* Couple indicator */}
                {member.is_bride && (
                  <Badge variant="default" className="text-2xs tracking-wide shrink-0">
                    Bride
                  </Badge>
                )}
                {member.is_groom && (
                  <Badge variant="default" className="text-2xs tracking-wide shrink-0">
                    Groom
                  </Badge>
                )}

                {/* Label badge (personal title) */}
                {member.label && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-2xs tracking-wide shrink-0",
                      isRejected && "opacity-50",
                    )}
                  >
                    {member.label}
                  </Badge>
                )}

              </div>

              {/* Per-member notes */}
              {member.notes && (
                <NotesMarkdown content={member.notes} size="sm" />
              )}
            </div>
          </div>

          {status !== "active" && (
            <MemberStatus
              member={member}
              className="text-xs italic shrink-0 self-center"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;
