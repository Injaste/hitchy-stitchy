import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useTimelineModalStore } from "@/pages/admin/store/useTimelineModalStore";
import { useCueStore } from "@/pages/admin/store/useCueStore";
import { useEventMutations } from "../queries";
import { AssigneeCheckboxes } from "@/pages/admin/components/AssigneeCheckboxes";
import { ModalFooter } from "@/pages/admin/components/ModalFooter";
import { to24h, to12h } from "@/lib/timeFormat";
import type { TimelineEvent } from "../types";

export function EventModal() {
  const { teamRoles, currentRole, addLog } = useAdminStore();
  const {
    isEventModalOpen,
    editingEvent,
    eventModalDay,
    closeEventModal,
    openConfirmDeleteEvent,
    openConfirmUpdateActiveEvent,
  } = useTimelineModalStore();
  const { activeCueEvent, setActiveCueEvent } = useCueStore();
  const { create, update } = useEventMutations();

  const [timeValue, setTimeValue] = useState(
    editingEvent?.time ? to24h(editingEvent.time) : ""
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assignees = formData.getAll("assignees") as string[];
    if (assignees.length === 0) assignees.push(currentRole);

    const eventData: TimelineEvent = {
      id: editingEvent?.id || `evt-${Date.now()}`,
      time: to12h(timeValue),
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      assignees,
      isMainEvent: formData.get("isMainEvent") === "on",
      notes: formData.get("notes") as string,
      startedAt: editingEvent?.startedAt,
    };

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
    if (editingEvent.startedAt) return;
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
            <input
              required
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Assignees</Label>
            <AssigneeCheckboxes
              teamRoles={teamRoles}
              defaultAssignees={editingEvent?.assignees}
              feature="event"
            />
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

          <ModalFooter
            onCancel={closeEventModal}
            onDelete={editingEvent ? handleDelete : undefined}
            deleteLabel="Delete Event"
            submitLabel={editingEvent ? "Save Event" : "Add Event"}
            isPending={create.isPending || update.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
