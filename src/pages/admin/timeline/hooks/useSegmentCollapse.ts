import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SegmentCollapseState {
  /** Collapsed segment ids → true. Keyed by segment id; persisted to localStorage. */
  collapsed: Record<string, boolean>;
  toggle: (id: string) => void;
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
    }),
    { name: "hs-timeline-segment-collapse" },
  ),
);
