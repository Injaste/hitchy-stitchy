import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { useCueStore } from "@/pages/admin/store/useCueStore";
import { useEventMutations } from "../queries";

export function ConfirmUpdateActiveEventModal() {
  const { currentRole, addLog } = useAdminStore();
  const {
    isConfirmUpdateActiveEventModalOpen,
    pendingEventUpdate,
    closeConfirmUpdateActiveEvent,
  } = useModalStore();
  const { activeCueEvent, setActiveCueEvent } = useCueStore();
  const { update: updateEvent } = useEventMutations();

  const confirmUpdateActiveEvent = () => {
    if (!pendingEventUpdate) return;
    updateEvent.mutate(pendingEventUpdate);
    if (activeCueEvent?.id === pendingEventUpdate.id) setActiveCueEvent(pendingEventUpdate);
    addLog(currentRole, `Updated active event: ${pendingEventUpdate.title}`);
    closeConfirmUpdateActiveEvent();
  };

  return (
    <AlertDialog open={isConfirmUpdateActiveEventModalOpen} onOpenChange={closeConfirmUpdateActiveEvent}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Active Event?</AlertDialogTitle>
          <AlertDialogDescription>
            This event is currently live. Updating it will change the active cue display.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmUpdateActiveEvent}>Update Event</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
