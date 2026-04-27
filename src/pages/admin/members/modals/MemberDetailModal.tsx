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
import { CheckCircle2, Clock, Snowflake, UserX } from "lucide-react";

import { useAccess } from "../../hooks/useAccess";
import { useMemberModalStore } from "../hooks/useMemberModalStore";

const MemberDetailModal = () => {
  const isDetailOpen = useMemberModalStore((s) => s.isDetailOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const openEdit = useMemberModalStore((s) => s.openEdit);
  const openDelete = useMemberModalStore((s) => s.openDelete);
  const openFreeze = useMemberModalStore((s) => s.openFreeze);

  const { canUpdate } = useAccess();

  if (!selectedItem) return null;
  const member = selectedItem;

  const canFreeze = canUpdate("members.freeze");
  const isRoot = member.role.category === "root";
  const isRejected = !!member.rejected_at;
  const isFrozen = member.is_frozen;
  const isPending = !member.joined_at && !isRejected;

  const statusConfig = isRejected
    ? { icon: UserX, label: "Declined", className: "text-destructive/60" }
    : isFrozen
      ? { icon: Snowflake, label: "Frozen", className: "text-muted-foreground" }
      : isPending
        ? {
            icon: Clock,
            label: "Pending invite",
            className: "text-muted-foreground",
          }
        : { icon: CheckCircle2, label: "Active", className: "text-primary" };

  const StatusIcon = statusConfig.icon;

  const timelineItems = [
    member.invited_at && {
      label: "Invited",
      date: format(parseISO(member.invited_at), "d MMM yyyy"),
    },
    member.joined_at && {
      label: "Accepted",
      date: format(parseISO(member.joined_at), "d MMM yyyy"),
    },
    member.rejected_at && {
      label: "Declined",
      date: format(parseISO(member.rejected_at), "d MMM yyyy"),
    },
  ].filter(Boolean) as { label: string; date: string }[];

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member.display_name}</DialogTitle>
          <DialogDescription>
            Member profile and access details.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* Role */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Role
            </p>
            <Badge variant="outline" className="text-2xs tracking-wide">
              {member.role.short_name} · {member.role.name}
            </Badge>
          </div>

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
                    <span>{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogBody>

        <Separator />

        <DialogFooter>
          {!isRejected && canUpdate("members") && (
            <>
              {!isRoot && (
                <Button variant="destructive" size="sm" onClick={openDelete}>
                  Delete
                </Button>
              )}
              {!isRoot && canFreeze && (
                <Button
                  variant={isFrozen ? "outline" : "destructive"}
                  size="sm"
                  onClick={openFreeze}
                >
                  {isFrozen ? "Restore access" : "Freeze access"}
                </Button>
              )}
              <Button size="sm" onClick={openEdit} autoFocus>
                Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailModal;
