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
import { useCueStore } from "@/pages/admin/store/useCueStore";

export function ConfirmStartEventModal() {
  const { currentRole, addLog } = useAdminStore();
  const { isConfirmStartModalOpen, eventToStart, closeConfirmStart } =
    useModalStore();
  const { setActiveCueEvent } = useCueStore();

  const confirmStartEvent = () => {
    if (!eventToStart) return;
    const { event, day } = eventToStart;
    const timeNow = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const updatedEvent = { ...event, startedAt: timeNow };

    const { events, setEventsForDay, eventConfig } = useAdminStore.getState();
    for (const d of eventConfig.days) {
      const dayEvs = events[d.id] ?? [];
      const cleared = dayEvs.map((ev) => ({ ...ev, startedAt: undefined }));
      if (d.id === day) {
        setEventsForDay(
          d.id,
          cleared.map((ev) => (ev.id === event.id ? updatedEvent : ev)),
        );
      } else {
        setEventsForDay(d.id, cleared);
      }
    }

    setActiveCueEvent(updatedEvent);
    addLog(currentRole, `Started event: ${event.title}`);
    toast.success(`Event Started: ${event.title}`);
    closeConfirmStart();
  };

  return (
    <AlertDialog
      open={isConfirmStartModalOpen}
      onOpenChange={closeConfirmStart}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start Event?</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark <strong>{eventToStart?.event.title}</strong> as the
            active cue and clear any previously started event.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmStartEvent}>
            Start Event
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
