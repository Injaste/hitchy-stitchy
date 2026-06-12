import { createModalStore } from "../../hooks/useModalStore";
import type { EventDay } from "../types";

interface DayModalAddons {
  /** Open the delete modal for a specific day (days have no detail modal). */
  openDeleteDay: (day: EventDay) => void;
}

export const useDayModalStore = createModalStore<EventDay, DayModalAddons>(
  (set) => ({
    openDeleteDay: (day) => set({ selectedItem: day, isDeleteOpen: true }),
  }),
);
