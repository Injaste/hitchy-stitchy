import type { FC } from "react";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import NotesMarkdown from "@/components/custom/notes-markdown";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { type Member } from "../types";
import MemberStatus from "./MemberStatus";
import { getInitials, getMemberStatus } from "../utils";

interface MemberCardProps {
  member: Member;
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
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <div
            className={cn(
              "flex gap-3 flex-1 min-w-0",
              !member.notes && "items-center",
            )}
          >
            {/* Name-initials bubble */}
            <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              {getInitials(member.display_name)}
            </div>

            {/* Content */}
            <div className="space-y-1.5 flex-1 min-w-0">
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
                  <Badge
                    variant="default"
                    className="text-2xs tracking-wide shrink-0"
                  >
                    Bride
                  </Badge>
                )}
                {member.is_groom && (
                  <Badge
                    variant="default"
                    className="text-2xs tracking-wide shrink-0"
                  >
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

                {status !== "active" && (
                  <MemberStatus
                    member={member}
                    className="text-xs italic shrink-0 self-center flex sm:hidden ml-auto"
                  />
                )}
              </div>

              {member.notes && (
                <div className="hidden sm:block">
                  <NotesMarkdown content={member.notes} size="sm" />
                </div>
              )}
            </div>
          </div>

          {member.notes && (
            <div className="sm:hidden">
              <NotesMarkdown content={member.notes} size="sm" />
            </div>
          )}
          {status !== "active" && (
            <MemberStatus
              member={member}
              className="text-xs italic shrink-0 self-center hidden sm:flex"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;
