import { useState, useRef, useLayoutEffect, type FC } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SubmitButton from "@/components/custom/form/SubmitButton";

import { useAdminStore } from "../../store/useAdminStore";
import { useRoleMutations } from "../../roles/queries";
import { useAccess } from "../../hooks/useAccess";
import type { Role } from "../../roles/types";
import { type AccessLevel, type Resource, applyAccessLevel } from "../types";

import PermissionsTableHeader from "./PermissionsTableHeader";
import PermissionsTableBody from "./PermissionsTableBody";
import PermissionsTableFooter from "./PermissionsTableFooter";

interface Props {
  roles: Role[];
}

const PermissionsTable: FC<Props> = ({ roles }) => {
  const { eventId } = useAdminStore();
  const { canCreate, canUpdate, canDelete } = useAccess();
  const { create, update, remove } = useRoleMutations();

  const [addingRole, setAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);

  const tableWrapRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number | undefined>();

  useLayoutEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;
    const measure = () => {
      let scrollParent: HTMLElement = document.documentElement;
      let node = el.parentElement;
      while (node) {
        const { overflow, overflowY } = getComputedStyle(node);
        if (/(auto|scroll)/.test(overflow + overflowY)) {
          scrollParent = node;
          break;
        }
        node = node.parentElement;
      }
      const parentBottom = scrollParent.getBoundingClientRect().bottom;
      const elTop = el.getBoundingClientRect().top;
      const pb = parseFloat(getComputedStyle(scrollParent).paddingBottom) || 0;
      setTableHeight(parentBottom - elTop - pb);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  const handleToggle = (role: Role, resource: Resource, next: AccessLevel) => {
    if (!canUpdate("roles")) return;
    const newPerms = applyAccessLevel(role.permissions, resource, next);
    update.mutate({ event_id: eventId!, id: role.id, name: role.name, permissions: newPerms });
  };

  const handleRename = (role: Role, name: string) => {
    if (!canUpdate("roles")) return;
    update.mutate({ event_id: eventId!, id: role.id, name });
  };

  const handleCreate = () => {
    const name = newRoleName.trim();
    if (!name) return;
    create.mutate({ event_id: eventId!, name });
    setNewRoleName("");
    setAddingRole(false);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    remove.mutate({ event_id: eventId!, id: pendingDelete.id, name: pendingDelete.name });
    setPendingDelete(null);
  };

  const colCount = 1 + roles.length + (canCreate("roles") ? 1 : 0);

  return (
    <>
      <div
        ref={tableWrapRef}
        className="overflow-auto rounded-lg border border-border/60"
        style={tableHeight != null ? { height: tableHeight } : undefined}
      >
        <table className="w-full text-sm border-separate border-spacing-0">
          <PermissionsTableHeader
            roles={roles}
            canCreate={canCreate("roles")}
            canDelete={canDelete("roles")}
            canEdit={canUpdate("roles")}
            addingRole={addingRole}
            newRoleName={newRoleName}
            onSetAddingRole={setAddingRole}
            onSetNewRoleName={setNewRoleName}
            onCreate={handleCreate}
            onDelete={setPendingDelete}
            onRename={handleRename}
          />
          <PermissionsTableBody
            roles={roles}
            colCount={colCount}
            canCreate={canCreate("roles")}
            canUpdate={canUpdate("roles")}
            onToggle={handleToggle}
          />
          <PermissionsTableFooter
            colCount={colCount}
            canUpdate={canUpdate("roles")}
          />
        </table>
      </div>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="text-destructive">
            <AlertDialogTitle>Delete role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{pendingDelete?.name}"
              </span>
              ? Members assigned to this role will lose it but stay in the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="sm" autoFocus>
              Cancel
            </AlertDialogCancel>
            <SubmitButton
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              isPending={remove.isPending}
              isSuccess={remove.isSuccess}
              isError={remove.isError}
            >
              Delete
            </SubmitButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PermissionsTable;
