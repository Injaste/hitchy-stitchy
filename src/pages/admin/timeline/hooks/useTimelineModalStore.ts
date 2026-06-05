import { createModalStore } from "../../hooks/useModalStore";
import type { Timeline } from "../types";

export interface TimelineCreatePrefill {
  day: string | null;
  label: string | null;
  time_start: string | null;
}

export interface TimelineConfirm {
  item: Timeline;
  kind: "start" | "end";
  reason: "restart" | "early-start" | "early-end" | "will-end" | "confirm-end";
}

interface TimelineModalAdditional {
  createPrefill: TimelineCreatePrefill;
  setPrefillDay: (day: string | null) => void;
  openCreateWithLabel: (
    label: string | null,
    timeStart?: string | null,
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
  createPrefill: { day: null, label: null, time_start: null },
  setPrefillDay: (day) =>
    set({ createPrefill: { ...get().createPrefill, day } }),
  openCreateWithLabel: (label, timeStart = null) =>
    set({
      createPrefill: { ...get().createPrefill, label, time_start: timeStart },
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
