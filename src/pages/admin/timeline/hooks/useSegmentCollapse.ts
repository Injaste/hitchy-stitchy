import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SegmentCollapseState {
  /** Collapsed segment ids → true. Keyed by segment id; persisted to localStorage. */
  collapsed: Record<string, boolean>;
  toggle: (id: string) => void;
  /** Collapse / expand a set of segments at once (scoped to the given ids). */
  collapseAll: (ids: string[]) => void;
  expandAll: (ids: string[]) => void;
}

/**
 * Per-segment collapsed state on the timeline view, remembered across reloads
 * (localStorage). A light, view-only toggle — the data is untouched.
 */
export const useSegmentCollapse = create<SegmentCollapseState>()(
  persist(
    (set) => ({
      collapsed: {},
      toggle: (id) =>
        set((s) => ({ collapsed: { ...s.collapsed, [id]: !s.collapsed[id] } })),
      collapseAll: (ids) =>
        set((s) => ({
          collapsed: { ...s.collapsed, ...Object.fromEntries(ids.map((id) => [id, true])) },
        })),
      expandAll: (ids) =>
        set((s) => ({
          collapsed: { ...s.collapsed, ...Object.fromEntries(ids.map((id) => [id, false])) },
        })),
    }),
    { name: "hs-timeline-segment-collapse" },
  ),
);
