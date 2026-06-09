import { createModalStore } from "../../hooks/useModalStore";
import type { Timeline } from "../types";

export interface TimelineCreatePrefill {
  /** The active day tab ("yyyy-MM-dd"). Drives which day is shown. */
  date: string | null;
  /** The segment a new item will be created in. */
  segment_id: string | null;
  label: string | null;
  time_start: string | null;
  /** Indicative create-modal header (e.g. "Add to Reception"); null = default. */
  title: string | null;
}

export interface TimelineConfirm {
  item: Timeline;
  kind: "start" | "end";
  reason: "restart" | "early-start" | "early-end" | "will-end" | "confirm-end";
}

interface TimelineModalAdditional {
  createPrefill: TimelineCreatePrefill;
  setActiveDate: (date: string | null) => void;
  openCreate: (
    segmentId: string | null,
    label?: string | null,
    timeStart?: string | null,
    title?: string | null,
  ) => void;

  isConfirmOpen: boolean;
  confirm: TimelineConfirm | null;
  openConfirm: (confirm: TimelineConfirm) => void;
  closeConfirm: () => void;
  extendedCloseAll: () => void;
  extendedReset: () => void;
}

export const useTimelineModalStore = createModalStore<
  Timeline,
  TimelineModalAdditional
>((set, get) => ({
  createPrefill: {
    date: null,
    segment_id: null,
    label: null,
    time_start: null,
    title: null,
  },
  setActiveDate: (date) =>
    set({ createPrefill: { ...get().createPrefill, date } }),
  openCreate: (segmentId, label = null, timeStart = null, title = null) =>
    set({
      createPrefill: {
        ...get().createPrefill,
        segment_id: segmentId,
        label,
        time_start: timeStart,
        title,
      },
      isCreateOpen: true,
    }),

  isConfirmOpen: false,
  confirm: null,
  openConfirm: (confirm) => set({ isConfirmOpen: true, confirm }),
  closeConfirm: () => {
    set({ isConfirmOpen: false });
    // Defer clearing `confirm` so modal copy doesn't flicker during exit animation.
    setTimeout(() => set({ confirm: null }), 200);
  },
  extendedCloseAll: () => set({ isConfirmOpen: false }),
  extendedReset: () => set({ confirm: null }),
}));
