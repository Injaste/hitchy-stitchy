import { Snowflake, Sun } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useMemberMutations } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

const MemberFreezeModal = () => {
  const isFreezeOpen = useMemberModalStore((s) => s.isFreezeOpen);
  const selectedItem = useMemberModalStore((s) => s.selectedItem);
  const closeAll = useMemberModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { freeze } = useMemberMutations();

  useCloseOnSuccess(freeze.isSuccess, closeAll);

  if (!selectedItem) return null;
  const member = selectedItem;
  const willFreeze = !member.frozen_at;

  const handleConfirm = () => {
    freeze.mutate({ event_id: eventId!, id: member.id, freeze: willFreeze });
  };

  return (
    <AlertDialog open={isFreezeOpen} onOpenChange={closeAll}>
      <AlertDialogContent>
        <AlertDialogHeader className={willFreeze ? "text-freeze" : undefined}>
          <AlertDialogTitle className="flex items-center gap-2">
            {willFreeze ? (
              <Snowflake className="size-5 shrink-0" />
            ) : (
              <Sun className="size-5 shrink-0" />
            )}
            {willFreeze ? "Freeze access" : "Restore access"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {willFreeze ? (
              <>
                <span className="font-semibold text-foreground">
                  {member.display_name}
                </span>{" "}
                will lose access to the event until restored. Their record stays
                in place.
              </>
            ) : (
              <>
                Restore access for{" "}
                <span className="font-semibold text-foreground">
                  {member.display_name}
                </span>
                ? They will regain full access to the event.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            variant="outline"
            size="sm"
            onClick={closeAll}
            disabled={freeze.isPending}
            autoFocus
          >
            Cancel
          </AlertDialogCancel>
          <SubmitButton
            type="button"
            variant={willFreeze ? "freeze" : "default"}
            size="sm"
            onClick={handleConfirm}
            isPending={freeze.isPending}
            isSuccess={freeze.isSuccess}
            isError={freeze.isError}
          >
            {willFreeze ? "Freeze access" : "Restore access"}
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MemberFreezeModal;
