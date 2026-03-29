import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { useCueStore } from "@/pages/admin/store/useCueStore";
import { useEventMutations } from "../queries";
import { AssigneeCheckboxes } from "@/pages/admin/components/AssigneeCheckboxes";
import { ModalFooter } from "@/pages/admin/components/ModalFooter";
import type { TimelineEvent } from "../types";

/** Convert "07:00 AM" → "07:00" (24hr for <input type="time">) */
function to24h(display: string): string {
  if (!display) return "";
  const match = display.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return display;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === "AM" && hours === 12) hours = 0;
  if (period === "PM" && hours !== 12) hours += 12;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

/** Convert "07:00" (24hr) → "07:00 AM" */
function to12h(value: string): string {
  if (!value) return "";
  const [hStr, mStr] = value.split(":");
  let hours = parseInt(hStr, 10);
  const minutes = mStr;
  const period = hours >= 12 ? "PM" : "AM";
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
}

export function EventModal() {
  const { teamRoles, currentRole, addLog } = useAdminStore();
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
