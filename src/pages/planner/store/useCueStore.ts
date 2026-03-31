import { create } from "zustand";
import type { TimelineEvent } from "@/pages/planner/features/timeline/types";

interface CueState {
  activeCueEvent: TimelineEvent | null;
  notifiedEvents: Set<string>;

  setActiveCueEvent: (event: TimelineEvent) => void;
  clearCueEvent: () => void;
  markNotified: (id: string) => void;
}

export const useCueStore = create<CueState>((set) => ({
  activeCueEvent: null,
  notifiedEvents: new Set<string>(),

  setActiveCueEvent: (event) => set({ activeCueEvent: event }),
  clearCueEvent: () => set({ activeCueEvent: null }),
  markNotified: (id) =>
    set((state) => ({
      notifiedEvents: new Set(state.notifiedEvents).add(id),
    })),
}));
