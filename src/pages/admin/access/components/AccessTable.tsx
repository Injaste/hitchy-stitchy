import { useState, useRef, useLayoutEffect, type FC } from "react";

import { useAdminStore } from "../../store/useAdminStore";
import { useAccessGroupMutations } from "../queries";
import { useAccess } from "../../hooks/useAccess";
import type { AccessGroup } from "../types";
import { type AccessLevel, type Resource, applyAccessLevel } from "../types";

import AccessTableHeader from "./AccessTableHeader";
import AccessTableBody from "./AccessTableBody";
import AccessTableFooter from "./AccessTableFooter";

interface Props {
  accessGroups: AccessGroup[];
  availableResources: string[];
}

const AccessTable: FC<Props> = ({ accessGroups, availableResources }) => {
  const { eventId } = useAdminStore();
  const { isSuperAdmin } = useAccess();
  const { create, update } = useAccessGroupMutations();

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

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

  const handleToggle = (group: AccessGroup, resource: Resource, next: AccessLevel) => {
    if (!isSuperAdmin) return;
    const newPerms = applyAccessLevel(group.permissions, resource, next);
    update.mutate({
      event_id: eventId!,
      id: group.id,
      name: group.name,
      permissions: newPerms,
    });
  };

  const handleRename = (group: AccessGroup, name: string) => {
    if (!isSuperAdmin) return;
    update.mutate({ event_id: eventId!, id: group.id, name });
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    create.mutate({ event_id: eventId!, name });
    setNewName("");
    setAdding(false);
  };

  const colCount = 1 + accessGroups.length + (isSuperAdmin ? 1 : 0);

  return (
    <div
      ref={tableWrapRef}
      className="overflow-auto rounded-lg border border-border/60"
      style={tableHeight != null ? { maxHeight: tableHeight } : undefined}
    >
      <table className="w-full text-sm border-separate border-spacing-0">
        <AccessTableHeader
          accessGroups={accessGroups}
          canCreate={isSuperAdmin}
          canDelete={isSuperAdmin}
          canEdit={isSuperAdmin}
          adding={adding}
          newName={newName}
          onSetAdding={setAdding}
          onSetNewName={setNewName}
          onCreate={handleCreate}
          onRename={handleRename}
        />
        <AccessTableBody
          accessGroups={accessGroups}
          availableResources={availableResources}
          colCount={colCount}
          canCreate={isSuperAdmin}
          canUpdate={isSuperAdmin}
          onToggle={handleToggle}
        />
        <AccessTableFooter colCount={colCount} />
      </table>
    </div>
  );
};

export default AccessTable;
