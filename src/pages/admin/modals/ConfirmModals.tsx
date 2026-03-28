import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StickyNote, Users } from "lucide-react";
import { toast } from "sonner";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { useCueStore } from "@/pages/admin/store/useCueStore";
import { useEventMutations } from "@/pages/admin/features/timeline/queries";

export function ConfirmModals() {
  const {
    teamRoles,
    day1Events,
    day2Events,
    setDay1Events,
    setDay2Events,
    tasks,
    setTasks,
    currentRole,
    addLog,
  } = useAdminStore();
  const {
    isConfirmStartModalOpen, eventToStart, closeConfirmStart,
    isConfirmDeleteTaskModalOpen, taskToDelete, closeConfirmDeleteTask,
    isConfirmDeleteEventModalOpen, eventToDelete, closeConfirmDeleteEvent,
    isConfirmDeleteRoleModalOpen, roleToDelete, closeConfirmDeleteRole,
    isConfirmUpdateActiveEventModalOpen, pendingEventUpdate, closeConfirmUpdateActiveEvent,
    isActiveCueModalOpen, closeActiveCueModal,
  } = useModalStore();
  const { activeCueEvent, setActiveCueEvent } = useCueStore();
  const { update: updateEvent } = useEventMutations();

  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  const getAssigneeDisplay = (roleName: string) => {
    if (roleName === "All") return "All";
    const role = teamRoles.find((r) => r.role === roleName);
    if (role) return `${role.shortRole} – ${role.names.join(" & ")}`;
    return roleName;
  };

  // ── Confirm Start Event ──────────────────────────────────────────────────
  const confirmStartEvent = () => {
    if (!eventToStart) return;
    const { event, day } = eventToStart;
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedEvent = { ...event, startedAt: timeNow };
    const clearStarted = (evs: typeof day1Events) => evs.map((ev) => ({ ...ev, startedAt: undefined }));
    if (day === "day1") {
      setDay1Events(clearStarted(day1Events).map((ev) => (ev.id === event.id ? updatedEvent : ev)));
      setDay2Events(clearStarted(day2Events));
    } else {
      setDay1Events(clearStarted(day1Events));
      setDay2Events(clearStarted(day2Events).map((ev) => (ev.id === event.id ? updatedEvent : ev)));
    }
    setActiveCueEvent(updatedEvent);
    addLog(currentRole, `Started event: ${event.title}`);
    toast.success(`Event Started: ${event.title}`);
    closeConfirmStart();
  };

  // ── Confirm Delete Task ──────────────────────────────────────────────────
  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    const task = tasks.find((t) => t.id === taskToDelete);
    if (task) {
      addLog(currentRole, `Deleted task: ${task.task}`);
      if (isAdmin || task.assignees.includes(currentRole) || task.assignees.includes("All"))
        toast(`Deleted task: ${task.task}`, { icon: "🗑️" });
    }
    setTasks(tasks.filter((t) => t.id !== taskToDelete));
    closeConfirmDeleteTask();
  };

  // ── Confirm Delete Event ─────────────────────────────────────────────────
  const confirmDeleteEvent = () => {
    if (!eventToDelete) return;
    const { id, day } = eventToDelete;
    if (day === "day1") {
      const evt = day1Events.find((e) => e.id === id);
      if (evt) { addLog(currentRole, `Deleted event: ${evt.title}`); toast(`Deleted event: ${evt.title}`, { icon: "🗑️" }); }
      setDay1Events(day1Events.filter((e) => e.id !== id));
    } else {
      const evt = day2Events.find((e) => e.id === id);
      if (evt) { addLog(currentRole, `Deleted event: ${evt.title}`); toast(`Deleted event: ${evt.title}`, { icon: "🗑️" }); }
      setDay2Events(day2Events.filter((e) => e.id !== id));
    }
    closeConfirmDeleteEvent();
  };

  // ── Confirm Delete Role ──────────────────────────────────────────────────
  const confirmDeleteRole = () => {
    if (!roleToDelete) return;
    const { setTeamRoles, teamRoles: roles } = useAdminStore.getState();
    setTeamRoles(roles.filter((r) => r.role !== roleToDelete.role));
    addLog(currentRole, `Deleted role: ${roleToDelete.role}`);
    toast.success(`Deleted role: ${roleToDelete.role}`);
    closeConfirmDeleteRole();
  };

  // ── Confirm Update Active Event ──────────────────────────────────────────
  const confirmUpdateActiveEvent = () => {
    if (!pendingEventUpdate) return;
    updateEvent.mutate(pendingEventUpdate);
    if (activeCueEvent?.id === pendingEventUpdate.id) setActiveCueEvent(pendingEventUpdate);
    addLog(currentRole, `Updated active event: ${pendingEventUpdate.title}`);
    closeConfirmUpdateActiveEvent();
  };

  return (
    <>
      {/* Active Cue Detail Modal */}
      <Dialog open={isActiveCueModalOpen} onOpenChange={closeActiveCueModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
          <DialogHeader>
            <DialogTitle>Active Event Details</DialogTitle>
          </DialogHeader>
          {activeCueEvent && (
            <div className="space-y-4 mt-4">
              <h3 className="text-xl font-bold text-primary">{activeCueEvent.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">Time:</span>
                  <p className="text-foreground">{activeCueEvent.time}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Assignees:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeCueEvent.assignees.map((role) => (
                      <span key={role} className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                        {getAssigneeDisplay(role)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground text-sm">Description:</span>
                <p className="text-foreground text-sm mt-1">{activeCueEvent.description}</p>
              </div>
              {activeCueEvent.notes && (
                <div>
                  <span className="font-semibold text-muted-foreground text-sm">Notes:</span>
                  <div className="mt-1 text-sm bg-primary/5 p-3 rounded-md text-primary border border-primary/10 flex gap-2 items-start">
                    <StickyNote className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <span className="leading-relaxed">{activeCueEvent.notes}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button onClick={closeActiveCueModal} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm: Start Event */}
      <AlertDialog open={isConfirmStartModalOpen} onOpenChange={closeConfirmStart}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark <strong>{eventToStart?.event.title}</strong> as the active cue and
              clear any previously started event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartEvent}>Start Event</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm: Delete Task */}
      <AlertDialog open={isConfirmDeleteTaskModalOpen} onOpenChange={closeConfirmDeleteTask}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/80">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm: Delete Event */}
      <AlertDialog open={isConfirmDeleteEventModalOpen} onOpenChange={closeConfirmDeleteEvent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/80">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm: Delete Role */}
      <AlertDialog open={isConfirmDeleteRoleModalOpen} onOpenChange={closeConfirmDeleteRole}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{roleToDelete?.role}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/80">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm: Update Active Event */}
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
    </>
  );
}
