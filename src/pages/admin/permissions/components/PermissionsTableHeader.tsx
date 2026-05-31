import { useState, useRef, type FC } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import type { Role } from "../../roles/types";

interface RoleHeaderProps {
  role: Role;
  canDelete: boolean;
  canEdit: boolean;
  onDelete: (role: Role) => void;
  onRename: (role: Role, name: string) => void;
}

export const RoleHeader: FC<RoleHeaderProps> = ({ role, canDelete, canEdit, onDelete, onRename }) => {
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
    <div className="group relative flex justify-center px-4 py-3.5">
      <div className="min-w-0 max-w-full text-center">
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
            className="w-full text-xs font-semibold bg-transparent outline-none rounded-sm ring-1 ring-primary/50 px-0.5 text-center"
            maxLength={60}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            title={canEdit ? "Click to rename" : undefined}
            className={cn(
              "text-xs font-semibold text-foreground truncate block w-full text-center",
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
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-destructive transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

interface PermissionsTableHeaderProps {
  roles: Role[];
  canCreate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  addingRole: boolean;
  newRoleName: string;
  onSetAddingRole: (v: boolean) => void;
  onSetNewRoleName: (v: string) => void;
  onCreate: () => void;
  onDelete: (role: Role) => void;
  onRename: (role: Role, name: string) => void;
}

const PermissionsTableHeader: FC<PermissionsTableHeaderProps> = ({
  roles,
  canCreate,
  canDelete,
  canEdit,
  addingRole,
  newRoleName,
  onSetAddingRole,
  onSetNewRoleName,
  onCreate,
  onDelete,
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
            onDelete={onDelete}
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

export default PermissionsTableHeader;
