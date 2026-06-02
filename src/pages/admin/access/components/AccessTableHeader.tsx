import { useState, useRef, type FC } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AccessGroup } from "../types";
import { useAccessModalStore } from "../hooks/useAccessModalStore";

interface AccessGroupHeaderProps {
  group: AccessGroup;
  canDelete: boolean;
  canEdit: boolean;
  onRename: (group: AccessGroup, name: string) => void;
}

export const AccessGroupHeader: FC<AccessGroupHeaderProps> = ({ group, canDelete, canEdit, onRename }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const openDeleteAccessGroup = useAccessModalStore((s) => s.openDeleteAccessGroup);

  const startEdit = () => {
    if (!canEdit) return;
    setDraft(group.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== group.name) onRename(group, trimmed);
    else setDraft(group.name);
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
              if (e.key === "Escape") { setEditing(false); setDraft(group.name); }
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
            {group.name}
          </Button>
        )}
      </div>
      {canDelete && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => openDeleteAccessGroup(group)}
          title="Delete access group"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
};

interface AccessTableHeaderProps {
  accessGroups: AccessGroup[];
  canCreate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  adding: boolean;
  newName: string;
  onSetAdding: (v: boolean) => void;
  onSetNewName: (v: string) => void;
  onCreate: () => void;
  onRename: (group: AccessGroup, name: string) => void;
}

const AccessTableHeader: FC<AccessTableHeaderProps> = ({
  accessGroups,
  canCreate,
  canDelete,
  canEdit,
  adding,
  newName,
  onSetAdding,
  onSetNewName,
  onCreate,
  onRename,
}) => (
  <thead className="sticky top-0 z-10 bg-card">
    <tr className="border-b border-border/60 bg-muted/40">
      <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground tracking-wide w-48">
        Feature
      </th>

      {accessGroups.map((group) => (
        <th key={group.id} className="w-36">
          <AccessGroupHeader
            group={group}
            canDelete={canDelete}
            canEdit={canEdit}
            onRename={onRename}
          />
        </th>
      ))}

      {canCreate && (
        <th className="w-36">
          {adding ? (
            <div className="flex justify-center items-center gap-1 px-4 py-3.5">
              <Input
                autoFocus
                value={newName}
                onChange={(e) => onSetNewName(e.target.value)}
                onBlur={() => {
                  if (!newName.trim()) {
                    onSetAdding(false);
                    onSetNewName("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCreate();
                  if (e.key === "Escape") { onSetAdding(false); onSetNewName(""); }
                }}
                placeholder="Access group name"
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
                onClick={() => onSetAdding(true)}
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

export default AccessTableHeader;
