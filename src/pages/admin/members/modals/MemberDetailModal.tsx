import { format, parseISO } from "date-fns";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogDetailActions,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  StickyNote,
  Snowflake,
  UserX,
} from "lucide-react";
import NotesMarkdown from "@/components/custom/notes-markdown";

import { useAccess } from "../../hooks/useAccess";
import { useAdminStore } from "../../store/useAdminStore";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { getMemberRank } from "../../utils/memberUtils";

const MemberDetailModal = () => {
  const isDetailOpen = useMemberModalStore((s) => s.isDetailOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const openEdit = useMemberModalStore((s) => s.openEdit);
  const openDelete = useMemberModalStore((s) => s.openDelete);
  const openFreeze = useMemberModalStore((s) => s.openFreeze);

  const { canUpdate } = useAccess();
  const {
    memberId,
    isRoot: callerIsRoot,
    isBride: memberIsBride,
    isGroom: memberIsGroom,
  } = useAdminStore();

  if (!selectedItem) return null;
  const member = selectedItem;

  const isSelf = member.id === memberId;
  const isInvitedByMe = member.invited_by === memberId;
  const canSeeEmail = isSelf || isInvitedByMe;

  const isRoot = member.is_root;
  const isCouple = member.is_bride || member.is_groom;
  const isRejected = !!member.rejected_at;
  const isFrozen = !!member.frozen_at;
  const isPending = !member.joined_at && !isRejected;

  // Hierarchy: caller can only act on members ranked strictly below them.
  const callerRank = callerIsRoot ? 0 : memberIsBride || memberIsGroom ? 1 : 2;
  const targetRank = getMemberRank(member);
  const callerOutranks = callerRank < targetRank;

  const statusConfig = isRejected
    ? { icon: UserX, label: "Declined", className: "text-destructive/60" }
    : isFrozen
      ? { icon: Snowflake, label: "Frozen", className: "text-destructive" }
      : isPending
        ? {
            icon: Clock,
            label: "Pending invite",
            className: "text-muted-foreground",
          }
        : { icon: CheckCircle2, label: "Active", className: "text-primary" };

  const StatusIcon = statusConfig.icon;

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

  const canManage = canUpdate("members");

  // Edit: caller must strictly outrank target. No self-edit.
  const canEdit = canManage && !isRejected && !isFrozen && callerOutranks;

  // Delete/Freeze: require strict hierarchy AND target must not be a couple member.
  const canDestructive = canManage && !isRoot && !isCouple && callerOutranks;

  const destructiveActions = [
    canDestructive && { label: "Delete", onClick: openDelete },
    canDestructive &&
      !isRejected &&
      canUpdate("members.freeze") && {
        label: isFrozen ? "Restore access" : "Freeze access",
        onClick: openFreeze,
        variant: isFrozen ? ("outline" as const) : ("destructive" as const),
      },
  ];
  const primaryAction = canEdit && { label: "Edit", onClick: openEdit };

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
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
          </DialogTitle>
          <DialogDescription>
            Member profile and access details.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            {/* Role + Label */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Role
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-2xs tracking-wide">
                  {member.role.name}
                </Badge>
                {member.label && (
                  <Badge variant="secondary" className="text-2xs tracking-wide">
                    {member.label}
                  </Badge>
                )}
              </div>
            </div>

            {/* Notes */}
            {member.notes && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <StickyNote strokeWidth={3} className="w-3 h-3" />
                    Notes
                  </p>
                  <NotesMarkdown content={member.notes} />
                </div>
              </>
            )}

            <Separator />

            {/* Status */}
            <div className="flex items-center gap-2">
              <StatusIcon
                className={`w-4 h-4 shrink-0 ${statusConfig.className}`}
              />
              <span className={`text-sm font-medium ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
            </div>

            {/* Email */}
            {canSeeEmail && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>{member.email}</span>
              </div>
            )}

            {/* History */}
            {timelineItems.length > 0 && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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

        <Separator />

        <DialogDetailActions
          destructive={destructiveActions}
          primary={primaryAction}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailModal;
