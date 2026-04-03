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

export function ConfirmDeleteRoleModal() {
  const { currentRole, addLog } = useAdminStore();
  const { isConfirmDeleteRoleModalOpen, roleToDelete, closeConfirmDeleteRole } =
    useModalStore();

  const confirmDeleteRole = () => {
    if (!roleToDelete) return;
    const { setTeamRoles, teamRoles: roles } = useAdminStore.getState();
    setTeamRoles(roles.filter((r) => r.role !== roleToDelete.role));
    addLog(currentRole, `Deleted role: ${roleToDelete.role}`);
    toast.success(`Deleted role: ${roleToDelete.role}`);
    closeConfirmDeleteRole();
  };

  return (
    <AlertDialog
      open={isConfirmDeleteRoleModalOpen}
      onOpenChange={closeConfirmDeleteRole}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Role?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove <strong>{roleToDelete?.role}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDeleteRole}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
