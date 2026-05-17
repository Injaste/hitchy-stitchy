import { Snowflake, Sun, TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

const MemberDeleteModal = () => {
  const isDeleteOpen = useMemberModalStore((s) => s.isDeleteOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { remove } = useMemberMutations();

  if (!selectedItem) return null;
  const member = selectedItem;

  const handleConfirm = () => {
    remove.mutate({ event_id: eventId!, id: member.id });
  };

  return (
    <AlertDialog open={isDeleteOpen} onOpenChange={closeAll}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-destructive">
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="size-5 shrink-0" />
            Delete access
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-foreground leading-relaxed text-left">
            <span className="font-semibold text-foreground">
              {member.display_name}
            </span>{" "}
            will be permanently removed from this event. Tasks they are assigned to will remain, but their name will be removed from those assignments.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            variant="outline"
            size="sm"
            onClick={closeAll}
            disabled={remove.isPending}
            autoFocus
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={remove.isPending}
          >
            {remove.isPending ? "Saving…" : "Delete access"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MemberDeleteModal;
