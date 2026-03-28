import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { useTaskMutations } from "../queries";
import type { ChecklistItem } from "../types";
import { useState } from "react";

export function TaskModal() {
  const { teamRoles, currentRole, addLog } = useAdminStore();
  const {
    isTaskModalOpen,
    editingTask,
    closeTaskModal,
    openConfirmDeleteTask,
  } = useModalStore();
  const { create, update } = useTaskMutations();

  const [priority, setPriority] = useState<ChecklistItem["priority"]>(
    editingTask?.priority ?? "Medium"
  );
  const [day, setDay] = useState<ChecklistItem["day"]>(
    editingTask?.day ?? "Pre-wedding"
  );

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

    const taskData: ChecklistItem = {
      id: editingTask?.id || `tsk-${Date.now()}`,
      task: formData.get("task") as string,
      assignees,
      completed: editingTask?.completed || false,
      priority,
      day,
      dueDate: formData.get("dueDate") as string,
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border p-3 rounded-md max-h-40 overflow-y-auto bg-card">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="assignee-All"
                  name="assignees"
                  value="All"
                  defaultChecked={editingTask?.assignees?.includes("All")}
                />
                <label htmlFor="assignee-All" className="text-sm cursor-pointer">All</label>
              </div>
              {teamRoles.map((r) => (
                <div key={r.role} className="flex items-center gap-2">
                  <Checkbox
                    id={`assignee-${r.role}`}
                    name="assignees"
                    value={r.role}
                    defaultChecked={editingTask?.assignees?.includes(r.role)}
                  />
                  <label htmlFor={`assignee-${r.role}`} className="text-sm cursor-pointer">
                    {getAssigneeDisplay(r.role)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Due Date (Optional)</Label>
            <Input
              name="dueDate"
              defaultValue={editingTask?.dueDate}
              placeholder="e.g. Oct 10"
            />
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
              <Select
                value={day}
                onValueChange={(v) => setDay(v as ChecklistItem["day"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pre-wedding">Pre-wedding</SelectItem>
                  <SelectItem value="Day 1">Day 1</SelectItem>
                  <SelectItem value="Day 2">Day 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes (Optional)</Label>
            <Textarea name="notes" defaultValue={editingTask?.notes} rows={2} />
          </div>

          <DialogFooter className="pt-4 flex-col sm:flex-row sm:justify-between w-full">
            {editingTask && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  closeTaskModal();
                  openConfirmDeleteTask(editingTask.id);
                }}
                className="w-full sm:w-auto mb-2 sm:mb-0"
              >
                Delete Task
              </Button>
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeTaskModal}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={create.isPending || update.isPending}
                className="w-full sm:w-auto"
              >
                Save Task
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
