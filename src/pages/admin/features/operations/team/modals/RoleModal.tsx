import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { useRoleMutations } from "../queries";
import type { TeamMember } from "../types";
import { toast } from "sonner";

export function RoleModal() {
  const { teamRoles, day1Events, day2Events, tasks, addLog, currentRole } = useAdminStore();
  const {
    isRoleModalOpen,
    editingRole,
    isNewRole,
    closeRoleModal,
    openConfirmDeleteRole,
  } = useModalStore();
  const { create, update } = useRoleMutations();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const namesString = formData.get("names") as string;
    const names = namesString.split(",").map((n) => n.trim()).filter(Boolean);
    const shortRole = formData.get("shortRole") as string;
    const description = formData.get("description") as string;

    if (isNewRole) {
      const roleTitle = formData.get("role") as string;
      const isAdminRole = formData.get("isAdmin") === "on";
      const newRole: TeamMember = { role: roleTitle, shortRole, names, description, isAdmin: isAdminRole };
      create.mutate(newRole);
      addLog(currentRole, `Added new role: ${roleTitle}`);
    } else if (editingRole) {
      const updated: TeamMember = { ...editingRole, shortRole, names, description };
      update.mutate(updated);
      addLog(currentRole, `Updated role: ${editingRole.role}`);
    }
  };

  const handleDelete = () => {
    if (!editingRole) return;
    const isAssignedToEvent =
      day1Events.some((e) => e.assignees.includes(editingRole.role)) ||
      day2Events.some((e) => e.assignees.includes(editingRole.role));
    const isAssignedToTask = tasks.some((t) => t.assignees.includes(editingRole.role));
    if (isAssignedToEvent || isAssignedToTask) {
      toast.error(`Cannot delete ${editingRole.role}. It is assigned to events or tasks.`);
      return;
    }
    closeRoleModal();
    openConfirmDeleteRole(editingRole);
  };

  return (
    <Dialog open={isRoleModalOpen} onOpenChange={closeRoleModal}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isNewRole ? "Add New Role" : `Edit Role: ${editingRole?.role}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isNewRole && (
            <div className="space-y-1.5">
              <Label>Role Title</Label>
              <Input required name="role" placeholder="e.g. Photographer" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Short Form</Label>
              <Input
                required
                name="shortRole"
                defaultValue={editingRole?.shortRole}
                placeholder="e.g. BM"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Checkbox
                id="isBridesmaid"
                name="isBridesmaid"
                defaultChecked={editingRole?.isBridesmaid}
              />
              <label htmlFor="isBridesmaid" className="text-sm font-medium text-muted-foreground cursor-pointer">
                Is Bridesmaid?
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Names (comma separated)</Label>
            <Input
              required
              name="names"
              defaultValue={editingRole?.names?.join(", ")}
              placeholder="e.g. Anna, John"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              name="description"
              defaultValue={editingRole?.description}
              rows={3}
            />
          </div>

          {isNewRole && (
            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="isAdminRole" name="isAdmin" />
              <label htmlFor="isAdminRole" className="text-sm font-medium text-muted-foreground cursor-pointer">
                Grant Admin Permissions
              </label>
            </div>
          )}

          <DialogFooter className="pt-4 flex-col sm:flex-row sm:justify-between w-full">
            {!isNewRole && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="w-full sm:w-auto mb-2 sm:mb-0"
              >
                Delete Role
              </Button>
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeRoleModal}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={create.isPending || update.isPending}
                className="w-full sm:w-auto"
              >
                {isNewRole ? "Add Role" : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
