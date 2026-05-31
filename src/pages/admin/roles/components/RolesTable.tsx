import { useState, useRef, useLayoutEffect, type FC } from "react";

import { useAdminStore } from "../../store/useAdminStore";
import { useRoleMutations } from "../queries";
import { useAccess } from "../../hooks/useAccess";
import { useRolesModalStore } from "../hooks/useRolesModalStore";
import type { Role } from "../types";
import { type AccessLevel, type Resource, applyAccessLevel } from "../types";

import RolesTableHeader from "./RolesTableHeader";
import RolesTableBody from "./RolesTableBody";
import RolesTableFooter from "./RolesTableFooter";

interface Props {
  roles: Role[];
  availableResources: string[];
}

const RolesTable: FC<Props> = ({ roles, availableResources }) => {
  const { eventId } = useAdminStore();
  const { isSuperAdmin } = useAccess();
  const { create, update } = useRoleMutations();
  const openDeleteRole = useRolesModalStore((s) => s.openDeleteRole);

  const [addingRole, setAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

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
    if (!isSuperAdmin) return;
    const newPerms = applyAccessLevel(role.permissions, resource, next);
    update.mutate({
      event_id: eventId!,
      id: role.id,
      name: role.name,
      permissions: newPerms,
    });
  };

  const handleRename = (role: Role, name: string) => {
    if (!isSuperAdmin) return;
    update.mutate({ event_id: eventId!, id: role.id, name });
  };

  const handleCreate = () => {
    const name = newRoleName.trim();
    if (!name) return;
    create.mutate({ event_id: eventId!, name });
    setNewRoleName("");
    setAddingRole(false);
  };

  const colCount = 1 + roles.length + (isSuperAdmin ? 1 : 0);

  return (
    <div
      ref={tableWrapRef}
      className="overflow-auto rounded-lg border border-border/60"
      style={tableHeight != null ? { maxHeight: tableHeight } : undefined}
    >
      <table className="w-full text-sm border-separate border-spacing-0">
        <RolesTableHeader
          roles={roles}
          canCreate={isSuperAdmin}
          canDelete={isSuperAdmin}
          canEdit={isSuperAdmin}
          addingRole={addingRole}
          newRoleName={newRoleName}
          onSetAddingRole={setAddingRole}
          onSetNewRoleName={setNewRoleName}
          onCreate={handleCreate}
          onRename={handleRename}
        />
        <RolesTableBody
          roles={roles}
          availableResources={availableResources}
          colCount={colCount}
          canCreate={isSuperAdmin}
          canUpdate={isSuperAdmin}
          onToggle={handleToggle}
        />
        <RolesTableFooter
          colCount={colCount}
          canUpdate={isSuperAdmin}
        />
      </table>
    </div>
  );
};

export default RolesTable;
