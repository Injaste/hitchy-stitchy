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
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Copy, History, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import NotesMarkdown from "@/components/custom/notes-markdown";

import { useAccess } from "../../hooks/useAccess";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { getInitials, getMemberStatus } from "../utils";
import { isSuperAdminMember } from "../../utils/memberUtils";
import MemberStatus from "../components/MemberStatus";

const MemberDetailModal = () => {
  const isDetailOpen = useMemberModalStore((s) => s.isDetailOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const openEdit = useMemberModalStore((s) => s.openEdit);
  const openDelete = useMemberModalStore((s) => s.openDelete);
  const openFreeze = useMemberModalStore((s) => s.openFreeze);

  const {
    canManageMembers,
    canView,
    canSeeMemberEmail,
    guardEditMember,
    guardDeleteMember,
    guardFreezeMember,
  } = useAccess();

  if (!selectedItem) return null;
  const member = selectedItem;

  const isRejected = !!member.rejected_at;
  const isFrozen = !!member.frozen_at;
  const status = getMemberStatus(member);

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
    member.rejected_at && {
      label: "Declined",
      date: format(parseISO(member.rejected_at), formatDate),
      time: format(parseISO(member.rejected_at), formatTime),
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
      variant: isFrozen ? ("outline" as const) : ("freeze" as const),
    },
  ];
  const primaryAction = guardEditMember(member) && { label: "Edit", onClick: openEdit };
  const hasActions = !!primaryAction || destructiveActions.some(Boolean);

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              {getInitials(member.display_name)}
            </div>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="flex items-center gap-2 flex-wrap">
                {member.display_name}
                {member.is_bride && (
                  <Badge variant="default" className="text-2xs">
                    Bride
                  </Badge>
                )}
                {member.is_groom && (
                  <Badge variant="default" className="text-2xs">
                    Groom
                  </Badge>
                )}
                {member.role && (
                  <Badge variant="secondary" className="text-2xs">
                    {member.role}
                  </Badge>
                )}
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

            {/* Pending hint — shown to superadmins for members who haven't joined yet */}
            {status === "pending" && canSeeMemberEmail && (
              <div className="rounded-md bg-muted px-3 py-2.5 space-y-1.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  They'll appear active once they sign up with this email and accept the invite.
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(member.email ?? "");
                    toast.success("Email copied");
                  }}
                  className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3 shrink-0" />
                  {member.email}
                </button>
              </div>
            )}

            {/* Access group + email + permissions */}
            {canView("access") && (
              <div className="space-y-2">
                <Badge variant="outline" className="text-2xs tracking-wide">
                  <Shield className="w-3 h-3" />
                  {isSuperAdminMember(member)
                    ? "Full access"
                    : (member.accessGroup?.name ?? "Unknown access group")}
                </Badge>

                {canSeeMemberEmail && status !== "pending" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>{member.email}</span>
                  </div>
                )}
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
          <>
            <Separator />
            <DialogDetailActions
              destructive={destructiveActions}
              primary={primaryAction}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailModal;
