import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAdminStore } from "../../../store/useAdminStore";
import { useCreateTaskMutation, useUpdateTaskMutation } from "../../queries";
import type { Task, TaskPriority, TaskStatus } from "../../types";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

export function TaskModal({ open, onOpenChange, task }: TaskModalProps) {
  const { eventId } = useAdminStore();
  const isEditing = !!task;

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dayId, setDayId] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes ?? "");
      setPriority(task.priority);
      setStatus(task.status);
      setDayId(task.dayId);
    } else {
      setTitle("");
      setNotes("");
      setPriority("medium");
      setStatus("todo");
    }
  }, [task, open]);

  const { mutate: create, isPending: creating } = useCreateTaskMutation();
  const { mutate: update, isPending: updating } = useUpdateTaskMutation();
  const isPending = creating || updating;

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (isEditing && task) {
      update({ ...task, title, notes, priority, status, dayId });
    } else {
      create({
        eventId,
        dayId,
        title,
        notes,
        priority,
        status,
        checklist: [],
        assignees: [],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update task details." : "Create a new task."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Day</Label>
              <Select value={dayId} onValueChange={setDayId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent></SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !title.trim()}>
            {isEditing ? "Save" : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
