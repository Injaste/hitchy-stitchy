import { Fragment, useState, useRef, type FC } from "react";
import { CheckCircle2, Eye, Minus, PenLine, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  type AccessLevel,
  type Resource,
  RESOURCE_GROUPS,
  RESOURCE_LABELS,
  deriveAccessLevel,
  getResourcePermission,
  applyAccessLevel,
  cycleAccessLevel,
} from "../types";

const ACCESS_CONFIG: Record<
  AccessLevel,
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  full: { icon: CheckCircle2, label: "Full", className: "text-primary" },
  write: { icon: PenLine, label: "Edit", className: "text-muted-foreground" },
  read: { icon: Eye, label: "View", className: "text-muted-foreground/60" },
  none: { icon: Minus, label: "—", className: "text-muted-foreground/25" },
};

interface EditableCellProps {
  level: AccessLevel;
  resource: Resource;
  role: Role;
  onToggle: (role: Role, resource: Resource, next: AccessLevel) => void;
  disabled?: boolean;
}

const EditableCell: FC<EditableCellProps> = ({ level, resource, role, onToggle, disabled }) => {
  const { icon: Icon, label, className } = ACCESS_CONFIG[level];
  const next = cycleAccessLevel(level, resource);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(role, resource, next)}
      title={`${label} — click to change`}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium transition-opacity",
        className,
        !disabled && "hover:opacity-70 cursor-pointer",
        disabled && "cursor-default",
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {level !== "none" && <span>{label}</span>}
    </button>
  );
};

interface RoleHeaderProps {
  role: Role;
  canDelete: boolean;
  onDelete: (role: Role) => void;
  onRename: (role: Role, name: string) => void;
  canEdit: boolean;
}

const RoleHeader: FC<RoleHeaderProps> = ({ role, canDelete, onDelete, onRename, canEdit }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(role.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    if (!canEdit) return;
    setDraft(role.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== role.name) onRename(role, trimmed);
    else setDraft(role.name);
  };

  return (
    <div className="flex items-start justify-between gap-1 min-w-0">
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") { setEditing(false); setDraft(role.name); }
            }}
            className="w-full text-xs font-semibold bg-transparent border-b border-border outline-none pb-0.5"
            maxLength={60}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            title={canEdit ? "Click to rename" : undefined}
            className={cn(
              "text-xs font-semibold text-foreground truncate block w-full text-left",
              canEdit && "hover:text-primary transition-colors cursor-text",
              !canEdit && "cursor-default",
            )}
          >
            {role.name}
          </button>
        )}
      </div>
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(role)}
          title="Delete role"
          className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors mt-0.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

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

  const handleToggle = (role: Role, resource: Resource, next: AccessLevel) => {
    if (!canUpdate("roles")) return;
    const newPerms = applyAccessLevel(role.permissions, resource, next);
    update.mutate({ event_id: eventId!, id: role.id, permissions: newPerms });
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

  // Total column count: Feature + roles + (add button col)
  const colCount = 1 + roles.length + (canCreate("roles") ? 1 : 0);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40">
              <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground tracking-wide w-[36%]">
                Feature
              </th>

              {roles.map((role) => (
                <th key={role.id} className="px-4 py-3.5 text-left">
                  <RoleHeader
                    role={role}
                    canDelete={canDelete("roles")}
                    canEdit={canUpdate("roles")}
                    onDelete={setPendingDelete}
                    onRename={handleRename}
                  />
                </th>
              ))}

              {/* Add role column */}
              {canCreate("roles") && (
                <th className="px-4 py-3.5 text-left w-10">
                  {addingRole ? (
                    <div className="flex items-center gap-1">
                      <Input
                        autoFocus
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreate();
                          if (e.key === "Escape") { setAddingRole(false); setNewRoleName(""); }
                        }}
                        placeholder="Role name"
                        className="h-7 text-xs w-28"
                        maxLength={60}
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleCreate}>
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setAddingRole(true)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </Button>
                  )}
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {RESOURCE_GROUPS.map((group, gi) => (
              <Fragment key={`group-${gi}`}>
                <tr className="border-t border-border/40 bg-muted/20">
                  <td
                    colSpan={colCount}
                    className="px-5 py-2 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/50"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.resources.map((resource, ri) => (
                  <tr
                    key={resource}
                    className={cn(
                      "border-t border-border/30 transition-colors hover:bg-muted/20",
                      ri === group.resources.length - 1 && "border-b border-border/30",
                    )}
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground/90">
                      {RESOURCE_LABELS[resource]}
                    </td>

                    {roles.map((role) => {
                      const perm = getResourcePermission(role.permissions, resource);
                      const level = deriveAccessLevel(perm, resource);
                      return (
                        <td key={role.id} className="px-4 py-3.5">
                          <EditableCell
                            level={level}
                            resource={resource}
                            role={role}
                            onToggle={handleToggle}
                            disabled={!canUpdate("roles")}
                          />
                        </td>
                      );
                    })}

                    {/* Empty cell for add column */}
                    {canCreate("roles") && <td />}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3.5 border-t border-border/40 bg-muted/20 flex flex-wrap items-center gap-x-6 gap-y-2">
          {(Object.entries(ACCESS_CONFIG) as [AccessLevel, typeof ACCESS_CONFIG[AccessLevel]][]).map(
            ([level, { icon: Icon, label, className }]) => (
              <span
                key={level}
                className={cn("inline-flex items-center gap-1.5 text-xs", className)}
              >
                <Icon className="w-3.5 h-3.5" />
                {level === "none" ? "No access" : label}
              </span>
            ),
          )}
          {canUpdate("roles") && (
            <span className="text-[11px] text-muted-foreground/50 ml-auto italic">
              Click any cell to change access
            </span>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-destructive">
            <AlertDialogTitle>Delete role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{pendingDelete?.name}"</span>?
              Members assigned to this role will lose it but stay in the event.
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
