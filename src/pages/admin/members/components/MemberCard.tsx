import type { FC } from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import NotesMarkdown from "@/components/custom/notes-markdown";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { isSuperAdminMember } from "../../utils/memberUtils";
import type { Member } from "../types";
import MemberAvatar from "./MemberAvatar";
import MemberRole from "./MemberRole";
import MemberStatus from "./MemberStatus";
import { getMemberStatus } from "../utils";

interface MemberCardProps {
  member: Member;
  isSelf: boolean;
}

const MemberCard: FC<MemberCardProps> = ({ member, isSelf }) => {
  const openDetail = useMemberModalStore((s) => s.openDetail);

  const status = getMemberStatus(member);
  const isRejected = status === "rejected";
  const isFrozen = status === "frozen";
  const isCouple = member.is_bride || member.is_groom;
  const isSuperAdmin = isSuperAdminMember(member);

  return (
    <Card
      variant="interactive"
      className={cn(
        "relative border-l-4",
        isFrozen && "hover:ring-freeze",
        // Couple keeps the primary accent; otherwise the current user's own card
        // gets a green accent in place of a "You" badge.
        isCouple
          ? "border-l-primary"
          : isSelf
            ? "border-l-success"
            : "border-l-accent",
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
              member.notes && "items-center sm:items-start",
            )}
          >
            {/* Initials bubble */}
            <MemberAvatar member={member} className="sm:h-12 sm:w-12" />

            {/* Content */}
            <div className="space-y-1 flex-1 min-w-0">
              {/* Name row */}
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <p
                  className={cn(
                    "font-display text-sm font-medium text-foreground truncate",
                    isRejected && "line-through text-muted-foreground",
                  )}
                >
                  {member.display_name}
                </p>

                <MemberRole member={member} />

                {status !== "active" && (
                  <MemberStatus
                    member={member}
                    className="text-xs italic shrink-0 self-center flex sm:hidden ml-auto"
                  />
                )}
              </div>

              {/* Access group — superadmins (couple/root) always have full access */}
              {(isSuperAdmin || member.accessGroup?.name) && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                  <Shield className="w-3 h-3 shrink-0" />
                  <span>
                    {isSuperAdmin ? "Full access" : member.accessGroup?.name}
                  </span>
                </div>
              )}

              {member.notes && (
                <div className="hidden sm:block pt-0.5">
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
