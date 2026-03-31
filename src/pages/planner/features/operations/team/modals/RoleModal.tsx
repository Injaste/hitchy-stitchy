import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAdminStore } from "@/pages/planner/store/useAdminStore";
import { useModalStore } from "@/pages/planner/store/useModalStore";
import { useRoleMutations } from "../queries";
import { ModalFooter } from "@/pages/planner/components/ModalFooter";
import type { TeamMember } from "../types";
import { toast } from "sonner";

export function RoleModal() {
  const { teamRoles, events, tasks, addLog, currentRole } = useAdminStore();
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
    const names = namesString
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    const shortRole = formData.get("shortRole") as string;
    const description = formData.get("description") as string;

    const isBridesmaidChecked = formData.get("isBridesmaid") === "on";

    if (isNewRole) {
      const roleTitle = formData.get("role") as string;
      const isAdminRole = formData.get("isAdmin") === "on";
      const newRole: TeamMember = {
        role: roleTitle,
        shortRole,
        names,
        description,
        isAdmin: isAdminRole,
        isBridesmaid: isBridesmaidChecked,
      };
      create.mutate(newRole);
      addLog(currentRole, `Added new role: ${roleTitle}`);
    } else if (editingRole) {
      const updated: TeamMember = {
        ...editingRole,
        shortRole,
        names,
        description,
        isBridesmaid: isBridesmaidChecked,
      };
      update.mutate(updated);
      addLog(currentRole, `Updated role: ${editingRole.role}`);
    }
  };

  const handleDelete = () => {
    if (!editingRole) return;
    const isAssignedToEvent = Object.values(events).some((dayEvs) =>
      dayEvs.some((e) => e.assignees.includes(editingRole.role)),
    );
    const isAssignedToTask = tasks.some((t) =>
      t.assignees.includes(editingRole.role),
    );
    if (isAssignedToEvent || isAssignedToTask) {
      toast.error(
        `Cannot delete ${editingRole.role}. It is assigned to events or tasks.`,
      );
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
              <label
                htmlFor="isBridesmaid"
                className="text-sm font-medium text-muted-foreground cursor-pointer"
              >
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
              <label
                htmlFor="isAdminRole"
                className="text-sm font-medium text-muted-foreground cursor-pointer"
              >
                Grant Admin Permissions
              </label>
            </div>
          )}

          <ModalFooter
            onCancel={closeRoleModal}
            onDelete={!isNewRole ? handleDelete : undefined}
            deleteLabel="Delete Role"
            submitLabel={isNewRole ? "Add Role" : "Save Changes"}
            isPending={create.isPending || update.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
