import { format, parseISO } from "date-fns";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDetailActions,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, History, RefreshCw, Shield } from "lucide-react";
import NotesMarkdown from "@/components/custom/notes-markdown";
import ShareLink from "@/components/custom/share-link";
import { BASE_URL } from "@/lib/config";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useAccess } from "../../hooks/useAccess";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMembersQuery, useMemberMutations } from "../queries";
import { getMemberStatus, getInviteExpiry, INVITE_MESSAGE } from "../utils";
import { isSuperAdminMember } from "../../utils/memberUtils";
import MemberAvatar from "../components/MemberAvatar";
import MemberRole from "../components/MemberRole";
import MemberStatus from "../components/MemberStatus";

const MemberDetailModal = () => {
  const isDetailOpen = useMemberModalStore((s) => s.isDetailOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const openEdit = useMemberModalStore((s) => s.openEdit);
  const openDelete = useMemberModalStore((s) => s.openDelete);
  const openFreeze = useMemberModalStore((s) => s.openFreeze);
  const { slug, eventId } = useAdminStore();
  const { data: members } = useMembersQuery();
  const { regenerate } = useMemberMutations();

  const {
    canManageMembers,
    canView,
    guardEditMember,
    guardDeleteMember,
    guardFreezeMember,
  } = useAccess();

  if (!selectedItem) return null;
  // Prefer the live roster row so a regenerated token/expiry shows immediately.
  const member = members?.find((m) => m.id === selectedItem.id) ?? selectedItem;

  const isFrozen = !!member.frozen_at;
  const status = getMemberStatus(member);
  const inviteExpiry =
    (status === "pending" || status === "expired") && member.invite_expires_at
      ? getInviteExpiry(member.invite_expires_at)
      : null;

  const formatDate = "d MMM yyyy";
  const formatTime = "HH:mm";

  const timelineItems = [
    member.invited_at && {
      label: "Invited",
      date: format(parseISO(member.invited_at), formatDate),
      time: format(parseISO(member.invited_at), formatTime),
    },
    member.joined_at && {
      label: "Accepted",
      date: format(parseISO(member.joined_at), formatDate),
      time: format(parseISO(member.joined_at), formatTime),
    },
    member.frozen_at && {
      label: "Frozen",
      date: format(parseISO(member.frozen_at), formatDate),
      time: format(parseISO(member.frozen_at), formatTime),
    },
  ].filter(Boolean) as { label: string; date: string; time: string }[];

  const destructiveActions = [
    guardDeleteMember(member) && { label: "Delete", onClick: openDelete },
    guardFreezeMember(member) && {
      label: isFrozen ? "Restore access" : "Freeze access",
      onClick: openFreeze,
      variant: isFrozen ? ("sun" as const) : ("freeze" as const),
    },
  ];
  const primaryAction = guardEditMember(member) && {
    label: "Edit",
    onClick: openEdit,
  };
  const hasActions = !!primaryAction || destructiveActions.some(Boolean);

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <MemberAvatar member={member} />
            <div className="min-w-0 space-y-1">
              <DialogTitle className="flex items-center gap-2 flex-wrap">
                {member.display_name}
                <MemberRole member={member} />
              </DialogTitle>
              {status !== "active" && (
                <MemberStatus member={member} className="text-xs" />
              )}
            </div>
          </div>
        </DialogHeader>

        <DialogBody className={!hasActions ? "pb-4" : undefined}>
          <div className="space-y-6">
            {/* Notes — what this person handles */}
            <NotesMarkdown content={member.notes} />

            {/* Pending/expired — managers can re-share or regenerate the join link */}
            {(status === "pending" || status === "expired") &&
              canManageMembers &&
              member.invite_token && (
                <div className="rounded-md bg-muted px-3 py-2.5 space-y-2">
                  {inviteExpiry?.expired ? (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This invite link has expired. Regenerate to share a fresh one
                      with{" "}
                      <span className="font-semibold text-foreground">
                        {member.display_name}
                      </span>
                      .
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Share this single-use link so{" "}
                        <span className="font-semibold text-foreground">
                          {member.display_name}
                        </span>{" "}
                        can join
                        {inviteExpiry ? ` — expires in ${inviteExpiry.remaining}` : ""}
                        .
                      </p>
                      <ShareLink
                        url={`${BASE_URL}/${slug}/join?token=${member.invite_token}`}
                        message={INVITE_MESSAGE}
                      />
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      regenerate.mutate({
                        event_id: eventId!,
                        id: member.id,
                        invite_expires_at: member.invite_expires_at,
                      })
                    }
                    disabled={regenerate.isPending}
                    className="h-auto gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    <RefreshCw
                      className={`size-3 shrink-0 ${regenerate.isPending ? "animate-spin" : ""}`}
                    />
                    Regenerate link
                  </Button>
                </div>
              )}

            {/* Access group + permissions */}
            {canView("access") && (
              <div className="space-y-2">
                <Badge variant="outline" className="text-2xs tracking-wide">
                  <Shield className="w-3 h-3" />
                  {isSuperAdminMember(member)
                    ? "Full access"
                    : (member.accessGroup?.name ?? "Unknown access group")}
                </Badge>
              </div>
            )}

            {/* History */}
            {canManageMembers && timelineItems.length > 0 && (
              <>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <History className="w-3 h-3 shrink-0" />
                    History
                  </p>
                  <div className="space-y-1">
                    {timelineItems.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-xs text-muted-foreground"
                      >
                        <span>{item.label}</span>
                        <span className="flex gap-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {item.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {item.time}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogBody>

        {hasActions && (
          <DialogDetailActions
            destructive={destructiveActions}
            primary={primaryAction}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailModal;
