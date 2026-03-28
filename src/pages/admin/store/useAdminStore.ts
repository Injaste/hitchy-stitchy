import { create } from "zustand";
import {
  TEAM_ROLES,
  day1Timeline,
  day2Timeline,
  checklists,
  mockRSVPs,
  type TeamMember,
  type TimelineEvent,
  type ChecklistItem,
  type RSVP,
} from "@/lib/data";
import type { EventConfig, NotificationPrefs } from "@/pages/admin/features/settings/types";

interface LogEntry {
  id: number;
  time: string;
  role: string;
  msg: string;
}

const DEFAULT_EVENT_CONFIG: EventConfig = {
  name: "Dan & Nad Wedding",
  dateRange: { from: new Date("2026-07-04"), to: new Date("2026-07-05") },
  days: [
    { id: "day-1", date: new Date("2026-07-04"), label: "The Ceremony", venue: "De Hall Pte Ltd" },
    { id: "day-2", date: new Date("2026-07-05"), label: "The Reception", venue: "De Hall Pte Ltd" },
  ],
  rsvpDeadlineEnabled: false,
  rsvpDeadline: null,
  rsvpForm: {
    fields: {
      name:         { visible: true,  required: true  },
      phone:        { visible: true,  required: true  },
      guestsCount:  { visible: true,  required: true  },
      dietaryNotes: { visible: true,  required: false },
      mealChoice:   { visible: false, required: false },
      message:      { visible: false, required: false },
    },
    mode: "open",
    guestMin: 1,
    guestMax: 10,
    confirmationMessage: "Jazak Allah Khair! We look forward to celebrating with you.",
  },
};

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  eventStarted: true,
  taskAssigned: true,
  pinged: true,
  upcomingEvent: true,
  bridesmaidsCheckin: true,
};

interface AdminState {
  teamRoles: TeamMember[];
  currentRole: string;
  events: Record<string, TimelineEvent[]>;
  tasks: ChecklistItem[];
  rsvps: RSVP[];
  logs: LogEntry[];
  arrivals: Record<string, boolean>;
  activePage: string;
  eventConfig: EventConfig;
  notificationPrefs: NotificationPrefs;

  // Bootstrap context — set once from useBootstrap
  slug: string | null;
  eventId: string | null;
  isBootstrapped: boolean;
  bootstrapError: string | null;

  setTeamRoles: (roles: TeamMember[]) => void;
  setCurrentRole: (role: string) => void;
  getEventsForDay: (dayId: string) => TimelineEvent[];
  setEventsForDay: (dayId: string, events: TimelineEvent[]) => void;
  setTasks: (tasks: ChecklistItem[]) => void;
  setRsvps: (rsvps: RSVP[]) => void;
  setArrivals: (arrivals: Record<string, boolean>) => void;
  addLog: (role: string, msg: string) => void;
  setActivePage: (page: string) => void;
  setEventConfig: (config: EventConfig) => void;
  setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;
  getDayById: (id: string) => EventConfig["days"][number] | undefined;
  setContext: (ctx: { slug: string; eventId: string; eventConfig: EventConfig }) => void;
  setBootstrapError: (msg: string) => void;
}

const getInitialArrivals = () => {
  const bridesmaids = TEAM_ROLES.filter((r) => r.isBridesmaid);
  return bridesmaids.reduce(
    (acc, b) => ({ ...acc, [b.role]: false }),
    {} as Record<string, boolean>
  );
};

export const useAdminStore = create<AdminState>((set, get) => ({
  teamRoles: TEAM_ROLES,
  currentRole: TEAM_ROLES[0].role,
  events: {
    "day-1": day1Timeline,
    "day-2": day2Timeline,
  },
  tasks: checklists,
  rsvps: mockRSVPs,
  logs: [],
  arrivals: getInitialArrivals(),
  activePage: "day-1",
  eventConfig: DEFAULT_EVENT_CONFIG,
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,

  slug: null,
  eventId: null,
  isBootstrapped: false,
  bootstrapError: null,

  setTeamRoles: (roles) => set({ teamRoles: roles }),
  setCurrentRole: (role) => set({ currentRole: role }),
  getEventsForDay: (dayId) => get().events[dayId] ?? [],
  setEventsForDay: (dayId, dayEvents) =>
    set((state) => ({ events: { ...state.events, [dayId]: dayEvents } })),
  setTasks: (tasks) => set({ tasks }),
  setRsvps: (rsvps) => set({ rsvps }),
  setArrivals: (arrivals) => set({ arrivals }),
  setActivePage: (page) => set({ activePage: page }),
  setEventConfig: (config) => set({ eventConfig: config }),
  setNotificationPref: (key, value) =>
    set((state) => ({
      notificationPrefs: { ...state.notificationPrefs, [key]: value },
    })),
  getDayById: (id) => get().eventConfig.days.find((d) => d.id === id),
  addLog: (role, msg) =>
    set((state) => ({
      logs: [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          role,
          msg,
        },
        ...state.logs,
      ],
    })),
  setContext: ({ slug, eventId, eventConfig }) =>
    set({ slug, eventId, eventConfig, isBootstrapped: true, bootstrapError: null }),
  setBootstrapError: (msg) =>
    set({ bootstrapError: msg, isBootstrapped: false }),
}));
