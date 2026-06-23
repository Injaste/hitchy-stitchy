import type { FC } from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import NotesMarkdown from "@/components/custom/notes-markdown";

import { isSuperAdminMember, getMemberStatus } from "../utils";
import type { Member } from "../types";
import MemberAvatar from "../components/MemberAvatar";
import MemberRole from "../components/MemberRole";
import MemberStatus from "../components/MemberStatus";

interface MemberCardProps {
  member: Member;
  isSelf: boolean;
}

/** Stripped member card — no modal, no click handler. Pure display. */
const MemberCard: FC<MemberCardProps> = ({ member, isSelf }) => {
  const status = getMemberStatus(member);
  const isFrozen = status === "frozen";
  const isCouple = member.is_bride || member.is_groom;
  const isSuperAdmin = isSuperAdminMember(member);

  return (
    <Card
      className={cn(
        "relative border-l-4",
        isFrozen && "hover:ring-freeze",
        isSelf
          ? "border-l-success"
          : isCouple
            ? "border-l-primary"
            : "border-l-accent",
        isFrozen && "opacity-60",
      )}
    >
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <div
            className={cn(
              "flex gap-3 flex-1 min-w-0",
              member.notes && "items-center sm:items-start",
            )}
          >
            <MemberAvatar member={member} className="sm:h-12 sm:w-12" />

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <p className="font-display text-sm font-medium text-foreground truncate">
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
