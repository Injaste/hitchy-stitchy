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

import { useAccess } from "../../hooks/useAccess";
import { useRoleModalStore } from "../hooks/useRoleModalStore";
import { CATEGORY_LABELS } from "../types";

const RoleDetailModal = () => {
  const isDetailOpen = useRoleModalStore((s) => s.isDetailOpen);
  const selectedItem = useRoleModalStore((s) => s.selectedItem);
  const closeAll = useRoleModalStore((s) => s.closeAll);
  const openEdit = useRoleModalStore((s) => s.openEdit);
  const openDelete = useRoleModalStore((s) => s.openDelete);

  const { canUpdate, canDelete } = useAccess();

  if (!selectedItem) return null;
  const role = selectedItem;
  const isRoot = role.category === "root";

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

        <DialogBody className="space-y-6">
          <p className="text-sm text-muted-foreground tracking-wide">
            {CATEGORY_LABELS[role.category]}
          </p>

          <Separator />

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </p>
            {role.description ? (
              <p className="text-sm leading-relaxed">{role.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">
                No description
              </p>
            )}
          </div>
        </DialogBody>

        <Separator />

        <DialogFooter>
          {canDelete("roles") && !isRoot && (
            <Button variant="destructive" size="sm" onClick={openDelete}>
              Delete
            </Button>
          )}
          {canUpdate("roles") && (
            <Button size="sm" onClick={openEdit} autoFocus>
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleDetailModal;
