import { StickyNote, Users } from "lucide-react";

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
import NotesMarkdown from "@/components/custom/notes-markdown";

import { useAccess } from "../../hooks/useAccess";
import { useRoleModalStore } from "../hooks/useRoleModalStore";
import { useMemberModalStore } from "../../members/hooks/useMemberModalStore";
import { useMembersQuery } from "../../members/queries";
import { getMemberStatus } from "../../members/utils";
import { CATEGORY_LABELS } from "../types";

const RoleDetailModal = () => {
  const isDetailOpen = useRoleModalStore((s) => s.isDetailOpen);
  const selectedItem = useRoleModalStore((s) => s.selectedItem);
  const closeAll = useRoleModalStore((s) => s.closeAll);
  const openEdit = useRoleModalStore((s) => s.openEdit);
  const openDelete = useRoleModalStore((s) => s.openDelete);

  const openMemberDetail = useMemberModalStore((s) => s.openDetail);
  const { data: allMembers } = useMembersQuery();

  const { canUpdate, canDelete } = useAccess();

  if (!selectedItem) return null;
  const role = selectedItem;
  const isRoot = role.category === "root";

  const roleMembers = (allMembers ?? []).filter(
    (m) => m.role_id === role.id && getMemberStatus(m) !== "rejected" && getMemberStatus(m) !== "frozen",
  );

  const destructiveActions = [
    canDelete("roles") && !isRoot && { label: "Delete", onClick: openDelete },
  ];
  const primaryAction = canUpdate("roles") && {
    label: "Edit",
    onClick: openEdit,
  };

  return (
    <Dialog open={isDetailOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {role.name}
            <Badge variant="outline">{role.short_name}</Badge>
          </DialogTitle>
          <DialogDescription>Role details and category.</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground tracking-wide">
              {CATEGORY_LABELS[role.category]}
            </p>

            <Separator />

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <StickyNote strokeWidth={3} className="w-3 h-3" />
                Description
              </p>
              <NotesMarkdown content={role.description} />
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Users strokeWidth={3} className="w-3 h-3" />
                Members
              </p>
              {roleMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members assigned.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {roleMembers.map((member) => (
                    <Badge
                      key={member.id}
                      variant="action"
                      className="text-2xs tracking-wide"
                      onClick={() => openMemberDetail(member)}
                    >
                      {member.display_name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
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

export default RoleDetailModal;
