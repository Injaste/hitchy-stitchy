import { useState, useRef, useLayoutEffect, useMemo, type FC } from "react";

import { useMembersQuery } from "../../members/queries";
import type { AccessGroup } from "../types";

import AccessTableHeader from "./AccessTableHeader";
import AccessTableBody from "./AccessTableBody";
import AccessTableFooter from "./AccessTableFooter";

interface Props {
  accessGroups: AccessGroup[];
  /** Resource catalog from event_resources (source of truth for what exists). */
  availableResources: string[];
}

const AccessTable: FC<Props> = ({ accessGroups, availableResources }) => {
  const { data: members } = useMembersQuery();

  const tableWrapRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number | undefined>();

  // Count members per access group for display.
  const memberCounts = useMemo(() => {
    return (members ?? []).reduce(
      (acc, m) => {
        acc[m.access_group_id] = (acc[m.access_group_id] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [members]);

  useLayoutEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;
    const measure = () => {
      let scrollParent: HTMLElement = document.documentElement;
      let node = el.parentElement;
      while (node) {
        const { overflow, overflowY } = getComputedStyle(node);
        if (/(auto|scroll)/.test(overflow + overflowY)) { scrollParent = node; break; }
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

  const colCount = 1 + accessGroups.length;

  // Group columns split the remaining width evenly (with a min so they don't
  // collapse) — the wrapper scrolls X when the mins exceed the viewport.
  const groupColWidth = `${Math.floor(100 / Math.max(accessGroups.length, 1))}%`;

  return (
    <div
      ref={tableWrapRef}
      className="overflow-auto rounded-lg border border-border/60"
      style={tableHeight != null ? { maxHeight: tableHeight } : undefined}
    >
      <table className="w-full text-sm border-separate border-spacing-0">
        <AccessTableHeader
          accessGroups={accessGroups}
          memberCounts={memberCounts}
          groupColWidth={groupColWidth}
        />
        <AccessTableBody
          accessGroups={accessGroups}
          availableResources={availableResources}
          colCount={colCount}
        />
        <AccessTableFooter colCount={colCount} />
      </table>
    </div>
  );
};

export default AccessTable;
