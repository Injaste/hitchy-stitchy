import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useChecklistModalStore } from "@/pages/admin/store/useChecklistModalStore";
import { useTaskMutations } from "../queries";
import { AssigneeCheckboxes } from "@/pages/admin/components/AssigneeCheckboxes";
import { ModalFooter } from "@/pages/admin/components/ModalFooter";
import type { ChecklistItem } from "../types";

export function TaskModal() {
  const { teamRoles, currentRole, addLog, eventConfig } = useAdminStore();

  const dayOptions = ["Pre-wedding", ...eventConfig.days.map((d) => d.label)];
  const {
    isTaskModalOpen,
    editingTask,
    closeTaskModal,
    openConfirmDeleteTask,
  } = useChecklistModalStore();
  const { create, update } = useTaskMutations();

  const [priority, setPriority] = useState<ChecklistItem["priority"]>(
    editingTask?.priority ?? "Medium"
  );
  const [day, setDay] = useState<string>(
    editingTask?.day ?? "Pre-wedding"
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(() => {
    if (!editingTask?.dueDate) return undefined;
    const d = new Date(editingTask.dueDate);
    return isNaN(d.getTime()) ? undefined : d;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assignees = formData.getAll("assignees") as string[];
    if (assignees.length === 0) assignees.push(currentRole);

    const taskData: ChecklistItem = {
      id: editingTask?.id || `tsk-${Date.now()}`,
      task: formData.get("task") as string,
      assignees,
      completed: editingTask?.completed || false,
      priority,
      day,
      dueDate: dueDate ? dueDate.toISOString().split("T")[0] : "",
      notes: formData.get("notes") as string,
    };

    if (editingTask) {
      update.mutate(taskData);
      addLog(currentRole, `Updated task: ${taskData.task}`);
    } else {
      const { id: _id, ...rest } = taskData;
      create.mutate(rest);
      addLog(currentRole, `Added task: ${taskData.task}`);
    }
  };

  return (
    <Dialog open={isTaskModalOpen} onOpenChange={closeTaskModal}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>Task</Label>
            <Input
              required
              name="task"
              defaultValue={editingTask?.task}
              placeholder="e.g. Confirm final headcount"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Assignees</Label>
            <AssigneeCheckboxes
              teamRoles={teamRoles}
              defaultAssignees={editingTask?.assignees}
              feature="task"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className={dueDate ? "" : "text-muted-foreground"}>
                    {dueDate ? format(dueDate, "do MMM yyyy") : "Pick a date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as ChecklistItem["priority"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Day</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes (Optional)</Label>
            <Textarea name="notes" defaultValue={editingTask?.notes} rows={2} />
          </div>

          <ModalFooter
            onCancel={closeTaskModal}
            onDelete={editingTask ? () => { closeTaskModal(); openConfirmDeleteTask(editingTask.id); } : undefined}
            deleteLabel="Delete Task"
            submitLabel={editingTask ? "Save Task" : "Add Task"}
            isPending={create.isPending || update.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
