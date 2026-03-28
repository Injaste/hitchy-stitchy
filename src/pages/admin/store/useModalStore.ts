import { create } from "zustand";
import type { TimelineEvent, ChecklistItem, TeamMember } from "@/lib/data";

interface ModalState {
  // Event modal
  isEventModalOpen: boolean;
  editingEvent: TimelineEvent | null;
  eventModalDay: "day1" | "day2";

  // Task modal
  isTaskModalOpen: boolean;
  editingTask: ChecklistItem | null;

  // Role modal
  isRoleModalOpen: boolean;
  editingRole: TeamMember | null;
  isNewRole: boolean;

  // Active cue modal
  isActiveCueModalOpen: boolean;

  // Confirm: start event
  isConfirmStartModalOpen: boolean;
  eventToStart: { event: TimelineEvent; day: "day1" | "day2" } | null;

  // Confirm: delete task
  isConfirmDeleteTaskModalOpen: boolean;
  taskToDelete: string | null;

  // Confirm: delete event
  isConfirmDeleteEventModalOpen: boolean;
  eventToDelete: { id: string; day: "day1" | "day2" } | null;

  // Confirm: delete role
  isConfirmDeleteRoleModalOpen: boolean;
  roleToDelete: TeamMember | null;

  // Confirm: update active event
  isConfirmUpdateActiveEventModalOpen: boolean;
  pendingEventUpdate: TimelineEvent | null;

  // Ping modal
  isPingModalOpen: boolean;
  pingTargetRole: string | null;

  // Actions
  openEventModal: (day: "day1" | "day2", event?: TimelineEvent) => void;
  closeEventModal: () => void;

  openTaskModal: (task?: ChecklistItem) => void;
  closeTaskModal: () => void;

  openAddRoleModal: () => void;
  openEditRoleModal: (member: TeamMember) => void;
  closeRoleModal: () => void;

  openActiveCueModal: () => void;
  closeActiveCueModal: () => void;

  openConfirmStart: (event: TimelineEvent, day: "day1" | "day2") => void;
  closeConfirmStart: () => void;

  openConfirmDeleteTask: (id: string) => void;
  closeConfirmDeleteTask: () => void;

  openConfirmDeleteEvent: (id: string, day: "day1" | "day2") => void;
  closeConfirmDeleteEvent: () => void;

  openConfirmDeleteRole: (role: TeamMember) => void;
  closeConfirmDeleteRole: () => void;

  openConfirmUpdateActiveEvent: (event: TimelineEvent) => void;
  closeConfirmUpdateActiveEvent: () => void;

  openPingModal: (role?: string) => void;
  closePingModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isEventModalOpen: false,
  editingEvent: null,
  eventModalDay: "day1",

  isTaskModalOpen: false,
  editingTask: null,

  isRoleModalOpen: false,
  editingRole: null,
  isNewRole: false,

  isActiveCueModalOpen: false,

  isConfirmStartModalOpen: false,
  eventToStart: null,

  isConfirmDeleteTaskModalOpen: false,
  taskToDelete: null,

  isConfirmDeleteEventModalOpen: false,
  eventToDelete: null,

  isConfirmDeleteRoleModalOpen: false,
  roleToDelete: null,

  isConfirmUpdateActiveEventModalOpen: false,
  pendingEventUpdate: null,

  isPingModalOpen: false,
  pingTargetRole: null,

  openEventModal: (day, event) =>
    set({ isEventModalOpen: true, eventModalDay: day, editingEvent: event ?? null }),
  closeEventModal: () =>
    set({ isEventModalOpen: false, editingEvent: null }),

  openTaskModal: (task) =>
    set({ isTaskModalOpen: true, editingTask: task ?? null }),
  closeTaskModal: () =>
    set({ isTaskModalOpen: false, editingTask: null }),

  openAddRoleModal: () =>
    set({ isRoleModalOpen: true, editingRole: null, isNewRole: true }),
  openEditRoleModal: (member) =>
    set({ isRoleModalOpen: true, editingRole: member, isNewRole: false }),
  closeRoleModal: () =>
    set({ isRoleModalOpen: false, editingRole: null }),

  openActiveCueModal: () => set({ isActiveCueModalOpen: true }),
  closeActiveCueModal: () => set({ isActiveCueModalOpen: false }),

  openConfirmStart: (event, day) =>
    set({ isConfirmStartModalOpen: true, eventToStart: { event, day } }),
  closeConfirmStart: () =>
    set({ isConfirmStartModalOpen: false, eventToStart: null }),

  openConfirmDeleteTask: (id) =>
    set({ isConfirmDeleteTaskModalOpen: true, taskToDelete: id }),
  closeConfirmDeleteTask: () =>
    set({ isConfirmDeleteTaskModalOpen: false, taskToDelete: null }),

  openConfirmDeleteEvent: (id, day) =>
    set({ isConfirmDeleteEventModalOpen: true, eventToDelete: { id, day } }),
  closeConfirmDeleteEvent: () =>
    set({ isConfirmDeleteEventModalOpen: false, eventToDelete: null }),

  openConfirmDeleteRole: (role) =>
    set({ isConfirmDeleteRoleModalOpen: true, roleToDelete: role }),
  closeConfirmDeleteRole: () =>
    set({ isConfirmDeleteRoleModalOpen: false, roleToDelete: null }),

  openConfirmUpdateActiveEvent: (event) =>
    set({ isConfirmUpdateActiveEventModalOpen: true, pendingEventUpdate: event }),
  closeConfirmUpdateActiveEvent: () =>
    set({ isConfirmUpdateActiveEventModalOpen: false, pendingEventUpdate: null }),

  openPingModal: (role) =>
    set({ isPingModalOpen: true, pingTargetRole: role ?? null }),
  closePingModal: () =>
    set({ isPingModalOpen: false, pingTargetRole: null }),
}));
