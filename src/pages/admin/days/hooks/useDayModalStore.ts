import { createCrudModalStore } from "../../hooks/modalStoreFactories";
import type { EventDay } from "../types";

interface DayModalAddons {
  /** Open the delete modal for a specific day (days have no detail modal). */
  openDeleteDay: (day: EventDay) => void;
}

export const useDayModalStore = createCrudModalStore<EventDay, DayModalAddons>(
  (set) => ({
    openDeleteDay: (day) => set({ selectedItem: day, isDeleteOpen: true }),
  }),
);
