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
import { toast } from "sonner";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";

export function ConfirmDeleteEventModal() {
  const { currentRole, addLog } = useAdminStore();
  const {
    isConfirmDeleteEventModalOpen,
    eventToDelete,
    closeConfirmDeleteEvent,
  } = useModalStore();

  const confirmDeleteEvent = () => {
    if (!eventToDelete) return;
    const { id, day } = eventToDelete;
    const { events, setEventsForDay } = useAdminStore.getState();
    const dayEvs = events[day] ?? [];
    const evt = dayEvs.find((e) => e.id === id);
    if (evt) {
      addLog(currentRole, `Deleted event: ${evt.title}`);
      toast(`Deleted event: ${evt.title}`, { icon: "🗑️" });
    }
    setEventsForDay(
      day,
      dayEvs.filter((e) => e.id !== id),
    );
    closeConfirmDeleteEvent();
  };

  return (
    <AlertDialog
      open={isConfirmDeleteEventModalOpen}
      onOpenChange={closeConfirmDeleteEvent}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Event?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDeleteEvent}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
