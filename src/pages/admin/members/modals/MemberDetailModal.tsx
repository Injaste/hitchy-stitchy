import { format, parseISO } from "date-fns";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

  const statusLabel = member.is_frozen
    ? "Frozen"
    : !member.joined_at
      ? "Pending invite"
      : "Active";

  const joinedLabel = member.joined_at
    ? format(parseISO(member.joined_at), "d MMM yyyy")
    : member.invited_at
      ? `Invited ${format(parseISO(member.invited_at), "d MMM yyyy")}`
      : null;

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent aria-describedby="">
        <DialogHeader className="flex flex-row items-center gap-2">
          <DialogTitle>{member.display_name}</DialogTitle>
          {member.role && (
            <>
              <span>·</span>
              <Badge variant="outline">{member.role.short_name}</Badge>
            </>
          )}
        </DialogHeader>

        <DialogBody className="space-y-6">
          <p className="text-xs tracking-wide text-muted-foreground">
            {statusLabel}
            {joinedLabel ? ` · ${joinedLabel}` : ""}
          </p>

          <Separator />

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Role
            </p>
            {member.role ? (
              <p className="text-sm">{member.role.name}</p>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">
                No role assigned
              </p>
            )}
          </div>
        </DialogBody>

        <Separator />

        <DialogFooter>
          {canUpdate("members") && (
            <>
              {member.role?.category !== "root" && (
                <Button variant="destructive" size="sm" onClick={openDelete}>
                  Delete
                </Button>
              )}
              {member.role?.category !== "root" && (
                <Button
                  variant={member.is_frozen ? "outline" : "destructive"}
                  size="sm"
                  onClick={openFreeze}
                >
                  {member.is_frozen ? "Restore access" : "Freeze access"}
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
