import { useState, useRef, type FC } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Role } from "../types";
import { useRolesModalStore } from "../hooks/useRolesModalStore";

interface RoleHeaderProps {
  role: Role;
  canDelete: boolean;
  canEdit: boolean;
  onRename: (role: Role, name: string) => void;
}

export const RoleHeader: FC<RoleHeaderProps> = ({ role, canDelete, canEdit, onRename }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(role.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const openDeleteRole = useRolesModalStore((s) => s.openDeleteRole);

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
    <div className="group relative flex justify-center px-4 py-3.5">
      <div className="min-w-0 max-w-full text-center">
        {editing ? (
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") { setEditing(false); setDraft(role.name); }
            }}
            className="h-7 text-xs text-center"
            maxLength={60}
            autoFocus
          />
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={startEdit}
            disabled={!canEdit}
            title={canEdit ? "Click to rename" : undefined}
            className={cn(
              "h-auto w-full px-1 py-0 text-xs font-semibold text-foreground truncate justify-center bg-transparent hover:bg-transparent disabled:opacity-100",
              canEdit && "hover:text-primary cursor-text",
            )}
          >
            {role.name}
          </Button>
        )}
      </div>
      {canDelete && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => openDeleteRole(role)}
          title="Delete role"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
};

interface RolesTableHeaderProps {
  roles: Role[];
  canCreate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  addingRole: boolean;
  newRoleName: string;
  onSetAddingRole: (v: boolean) => void;
  onSetNewRoleName: (v: string) => void;
  onCreate: () => void;
  onRename: (role: Role, name: string) => void;
}

const RolesTableHeader: FC<RolesTableHeaderProps> = ({
  roles,
  canCreate,
  canDelete,
  canEdit,
  addingRole,
  newRoleName,
  onSetAddingRole,
  onSetNewRoleName,
  onCreate,
  onRename,
}) => (
  <thead className="sticky top-0 z-10 bg-card">
    <tr className="border-b border-border/60 bg-muted/40">
      <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground tracking-wide w-48">
        Feature
      </th>

      {roles.map((role) => (
        <th key={role.id} className="w-36">
          <RoleHeader
            role={role}
            canDelete={canDelete}
            canEdit={canEdit}
            onRename={onRename}
          />
        </th>
      ))}

      {canCreate && (
        <th className="w-36">
          {addingRole ? (
            <div className="flex justify-center items-center gap-1 px-4 py-3.5">
              <Input
                autoFocus
                value={newRoleName}
                onChange={(e) => onSetNewRoleName(e.target.value)}
                onBlur={() => {
                  if (!newRoleName.trim()) {
                    onSetAddingRole(false);
                    onSetNewRoleName("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCreate();
                  if (e.key === "Escape") { onSetAddingRole(false); onSetNewRoleName(""); }
                }}
                placeholder="Role name"
                className="h-7 text-xs w-28"
                maxLength={60}
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={onCreate}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center px-4 py-3.5">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onSetAddingRole(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>
          )}
        </th>
      )}
    </tr>
  </thead>
);

export default RolesTableHeader;
