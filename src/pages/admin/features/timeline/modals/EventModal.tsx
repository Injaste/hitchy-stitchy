import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { useCueStore } from "@/pages/admin/store/useCueStore";
import { useEventMutations } from "../queries";
import type { TimelineEvent } from "../types";

export function EventModal() {
  const { teamRoles, currentRole, day1Events, day2Events, setDay1Events, setDay2Events, addLog } =
    useAdminStore();
  const {
    isEventModalOpen,
    editingEvent,
    eventModalDay,
    closeEventModal,
    openConfirmDeleteEvent,
    openConfirmUpdateActiveEvent,
  } = useModalStore();
  const { activeCueEvent, setActiveCueEvent } = useCueStore();
  const { create, update } = useEventMutations();

  const getAssigneeDisplay = (roleName: string) => {
    if (roleName === "All") return "All";
    const role = teamRoles.find((r) => r.role === roleName);
    if (role) return `${role.shortRole} – ${role.names.join(" & ")}`;
    return roleName;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assignees = formData.getAll("assignees") as string[];
    if (assignees.length === 0) assignees.push(currentRole);

    const eventData: TimelineEvent = {
      id: editingEvent?.id || `evt-${Date.now()}`,
      time: formData.get("time") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      assignees,
      isMainEvent: formData.get("isMainEvent") === "on",
      notes: formData.get("notes") as string,
      startedAt: editingEvent?.startedAt,
    };

    // If editing an active event, confirm first
    if (editingEvent?.startedAt) {
      openConfirmUpdateActiveEvent(eventData);
      closeEventModal();
      return;
    }

    if (editingEvent) {
      update.mutate(eventData);
      addLog(currentRole, `Updated event: ${eventData.title}`);
    } else {
      const { id: _id, ...rest } = eventData;
      create.mutate(rest);
      addLog(currentRole, `Added event: ${eventData.title}`);
    }
  };

  const handleDelete = () => {
    if (!editingEvent) return;
    if (editingEvent.startedAt) {
      return; // Can't delete active event — handled in ConfirmModals
    }
    closeEventModal();
    openConfirmDeleteEvent(editingEvent.id, eventModalDay);
  };

  return (
    <Dialog open={isEventModalOpen} onOpenChange={closeEventModal}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingEvent ? "Edit Event" : "Add Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>Time</Label>
            <Input
              required
              name="time"
              defaultValue={editingEvent?.time}
              placeholder="e.g. 07:00 AM"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Assignees</Label>
            <div className="bg-card border border-border rounded-md p-3 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="event-assignee-All"
                    name="assignees"
                    value="All"
                    defaultChecked={editingEvent?.assignees?.includes("All")}
                  />
                  <label htmlFor="event-assignee-All" className="text-sm cursor-pointer">All</label>
                </div>
                {teamRoles.map((r) => (
                  <div key={r.role} className="flex items-center gap-2">
                    <Checkbox
                      id={`event-assignee-${r.role}`}
                      name="assignees"
                      value={r.role}
                      defaultChecked={editingEvent?.assignees?.includes(r.role)}
                    />
                    <label htmlFor={`event-assignee-${r.role}`} className="text-sm cursor-pointer">
                      {getAssigneeDisplay(r.role)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              required
              name="title"
              defaultValue={editingEvent?.title}
              placeholder="e.g. Wake up & Breakfast"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              required
              name="description"
              defaultValue={editingEvent?.description}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notes (Optional)</Label>
            <Textarea name="notes" defaultValue={editingEvent?.notes} rows={2} />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="isMainEvent"
              name="isMainEvent"
              defaultChecked={editingEvent?.isMainEvent}
            />
            <label htmlFor="isMainEvent" className="text-sm font-medium text-muted-foreground cursor-pointer">
              Highlight as Main Event
            </label>
          </div>

          <DialogFooter className="pt-4 flex-col sm:flex-row sm:justify-between w-full">
            {editingEvent && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="w-full sm:w-auto mb-2 sm:mb-0"
              >
                Delete Event
              </Button>
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeEventModal}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={create.isPending || update.isPending}
                className="w-full sm:w-auto"
              >
                Save Event
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
