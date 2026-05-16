import { createModalStore } from "../../hooks/useModalStore";
import type { Timeline } from "../types";

export interface TimelineCreatePrefill {
  day: string | null;
  label: string | null;
}

interface TimelineModalAdditional {
  createPrefill: TimelineCreatePrefill;
  setPrefillDay: (day: string | null) => void;
  openCreateWithLabel: (label: string | null) => void;
}

// Note: createPrefill is NOT cleared on closeAll — same pattern as
// selectedItem in the base modal store. It persists until the next
// open* action overwrites it. Clearing it on close re-keys the create
// modal mid-animation and the exit transition is skipped.
export const useTimelineModalStore = createModalStore<Timeline, TimelineModalAdditional>(
  (set, get) => ({
    createPrefill: { day: null, label: null },
    setPrefillDay: (day) =>
      set({ createPrefill: { ...get().createPrefill, day } }),
    openCreateWithLabel: (label) =>
      set({
        createPrefill: { ...get().createPrefill, label },
        isCreateOpen: true,
      }),
  }),
);
