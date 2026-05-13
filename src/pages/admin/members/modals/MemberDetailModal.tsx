import { format, parseISO } from "date-fns";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Snowflake,
  UserX,
} from "lucide-react";

import { useAccess } from "../../hooks/useAccess";
import { useAdminStore } from "../../store/useAdminStore";
import { useMemberModalStore } from "../hooks/useMemberModalStore";

const MemberDetailModal = () => {
  const isDetailOpen = useMemberModalStore((s) => s.isDetailOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const openEdit = useMemberModalStore((s) => s.openEdit);
  const openDelete = useMemberModalStore((s) => s.openDelete);
  const openFreeze = useMemberModalStore((s) => s.openFreeze);

  const { canUpdate } = useAccess();
  const { memberId } = useAdminStore();

  if (!selectedItem) return null;
  const member = selectedItem;

  const isSelf = member.id === memberId;
  const isInvitedByMe = member.invited_by === memberId;

  const canSeeEmail = isSelf || isInvitedByMe;

  const isRoot = member.role.category === "root";
  const isRejected = !!member.rejected_at;
  const isFrozen = !!member.frozen_at;
  const isPending = !member.joined_at && !isRejected;

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

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member.display_name}</DialogTitle>
          <DialogDescription>
            Member profile and access details.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Role
              </p>
              <Badge variant="outline" className="text-2xs tracking-wide">
                {member.role.short_name} · {member.role.name}
              </Badge>
            </div>

            {canSeeEmail && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>{member.email}</span>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-2">
              <StatusIcon
                className={`w-4 h-4 shrink-0 ${statusConfig.className}`}
              />
              <span className={`text-sm font-medium ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
            </div>

            {/* History */}
            {timelineItems.length > 0 && (
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
            )}
          </div>
        </DialogBody>

        <Separator />

        <DialogFooter>
          {canUpdate("members") && (
            <>
              {!isRoot && (
                <Button variant="destructive" size="sm" onClick={openDelete}>
                  Delete
                </Button>
              )}
              {!isRoot && !isRejected && canUpdate("members.freeze") && (
                <Button
                  variant={isFrozen ? "outline" : "destructive"}
                  size="sm"
                  onClick={openFreeze}
                >
                  {isFrozen ? "Restore access" : "Freeze access"}
                </Button>
              )}
              {!isRejected && !isFrozen && (
                <Button size="sm" onClick={openEdit} autoFocus>
                  Edit
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailModal;
