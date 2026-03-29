import { create } from "zustand";
import type { TimelineEvent } from "@/pages/admin/features/timeline/types";

interface TimelineModalState {
  isEventModalOpen: boolean;
  editingEvent: TimelineEvent | null;
  eventModalDay: string;

  isConfirmStartModalOpen: boolean;
  eventToStart: { event: TimelineEvent; day: string } | null;

  isConfirmDeleteEventModalOpen: boolean;
  eventToDelete: { id: string; day: string } | null;

  isConfirmUpdateActiveEventModalOpen: boolean;
  pendingEventUpdate: TimelineEvent | null;

  openEventModal: (day: string, event?: TimelineEvent) => void;
  closeEventModal: () => void;

  openConfirmStart: (event: TimelineEvent, day: string) => void;
  closeConfirmStart: () => void;

  openConfirmDeleteEvent: (id: string, day: string) => void;
  closeConfirmDeleteEvent: () => void;

  openConfirmUpdateActiveEvent: (event: TimelineEvent) => void;
  closeConfirmUpdateActiveEvent: () => void;
}

export const useTimelineModalStore = create<TimelineModalState>((set) => ({
  isEventModalOpen: false,
  editingEvent: null,
  eventModalDay: "day-1",

  isConfirmStartModalOpen: false,
  eventToStart: null,

  isConfirmDeleteEventModalOpen: false,
  eventToDelete: null,

  isConfirmUpdateActiveEventModalOpen: false,
  pendingEventUpdate: null,

  openEventModal: (day, event) =>
    set({ isEventModalOpen: true, eventModalDay: day, editingEvent: event ?? null }),
  closeEventModal: () =>
    set({ isEventModalOpen: false, editingEvent: null }),

  openConfirmStart: (event, day) =>
    set({ isConfirmStartModalOpen: true, eventToStart: { event, day } }),
  closeConfirmStart: () =>
    set({ isConfirmStartModalOpen: false, eventToStart: null }),

  openConfirmDeleteEvent: (id, day) =>
    set({ isConfirmDeleteEventModalOpen: true, eventToDelete: { id, day } }),
  closeConfirmDeleteEvent: () =>
    set({ isConfirmDeleteEventModalOpen: false, eventToDelete: null }),

  openConfirmUpdateActiveEvent: (event) =>
    set({ isConfirmUpdateActiveEventModalOpen: true, pendingEventUpdate: event }),
  closeConfirmUpdateActiveEvent: () =>
    set({ isConfirmUpdateActiveEventModalOpen: false, pendingEventUpdate: null }),
}));
