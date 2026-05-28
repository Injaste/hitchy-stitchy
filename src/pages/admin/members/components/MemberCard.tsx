import type { FC } from "react";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import NotesMarkdown from "@/components/custom/notes-markdown";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useRoleModalStore } from "../../roles/hooks/useRoleModalStore";
import { type Member } from "../types";
import MemberStatus from "./MemberStatus";
import { getMemberStatus } from "../utils";
import { isAdminMember, isBrideOrGroom } from "../../bootstrap/utils";

interface MemberCardProps {
  member: Member;
}

const MemberCard: FC<MemberCardProps> = ({ member }) => {
  const openDetail = useMemberModalStore((s) => s.openDetail);
  const openRoleDetail = useRoleModalStore((s) => s.openDetail);

  const status = getMemberStatus(member);
  const isRejected = status === "rejected";
  const isFrozen = status === "frozen";

  return (
    <Card
      variant="interactive"
      className={cn(
        "relative border-l-4",
        isBrideOrGroom(member.role.name)
          ? "border-l-primary"
          : isAdminMember(member.role.category) && "border-l-secondary",
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
          <div className="flex gap-3 flex-1">
            {/* Role short name bubble */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              {member.role.short_name}
            </div>

            {/* Content */}

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <p
                  className={cn(
                    "font-display text-sm font-medium text-foreground truncate",
                    isRejected && "line-through text-muted-foreground",
                  )}
                >
                  {member.display_name}
                </p>
                <Badge
                  variant="action"
                  className={cn(
                    "relative z-10 text-2xs tracking-wide",
                    isRejected && "opacity-50",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    openRoleDetail(member.role);
                  }}
                >
                  {member.role.name}
                </Badge>
              </div>

              <NotesMarkdown content={member.role.description} size="sm" />
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
