import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useChecklistModalStore } from "@/pages/admin/store/useChecklistModalStore";

export function ConfirmDeleteTaskModal() {
  const { tasks, setTasks, currentRole, addLog, teamRoles } = useAdminStore();
  const { isConfirmDeleteTaskModalOpen, taskToDelete, closeConfirmDeleteTask } = useChecklistModalStore();

  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

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

  return (
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
  );
}
