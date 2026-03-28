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

interface LogEntry {
  id: number;
  time: string;
  role: string;
  msg: string;
}

type NotificationPrefs = {
  eventStarted: boolean;
  taskAssigned: boolean;
  pinged: boolean;
  upcomingEvent: boolean;
  bridesmaidsCheckin: boolean;
};

interface AdminState {
  teamRoles: TeamMember[];
  currentRole: string;
  day1Events: TimelineEvent[];
  day2Events: TimelineEvent[];
  tasks: ChecklistItem[];
  rsvps: RSVP[];
  logs: LogEntry[];
  arrivals: Record<string, boolean>;
  activePage: string;
  eventDays: 1 | 2;
  notificationPrefs: NotificationPrefs;

  setTeamRoles: (roles: TeamMember[]) => void;
  setCurrentRole: (role: string) => void;
  setDay1Events: (events: TimelineEvent[]) => void;
  setDay2Events: (events: TimelineEvent[]) => void;
  setTasks: (tasks: ChecklistItem[]) => void;
  setRsvps: (rsvps: RSVP[]) => void;
  setArrivals: (arrivals: Record<string, boolean>) => void;
  addLog: (role: string, msg: string) => void;
  setActivePage: (page: string) => void;
  setEventDays: (days: 1 | 2) => void;
  setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;
}

const getInitialArrivals = () => {
  const bridesmaids = TEAM_ROLES.filter((r) => r.isBridesmaid);
  return bridesmaids.reduce(
    (acc, b) => ({ ...acc, [b.role]: false }),
    {} as Record<string, boolean>
  );
};

export const useAdminStore = create<AdminState>((set) => ({
  teamRoles: TEAM_ROLES,
  currentRole: TEAM_ROLES[0].role,
  day1Events: day1Timeline,
  day2Events: day2Timeline,
  tasks: checklists,
  rsvps: mockRSVPs,
  logs: [],
  arrivals: getInitialArrivals(),
  activePage: "day1",
  eventDays: 2,
  notificationPrefs: {
    eventStarted: true,
    taskAssigned: true,
    pinged: true,
    upcomingEvent: true,
    bridesmaidsCheckin: true,
  },

  setTeamRoles: (roles) => set({ teamRoles: roles }),
  setCurrentRole: (role) => set({ currentRole: role }),
  setDay1Events: (events) => set({ day1Events: events }),
  setDay2Events: (events) => set({ day2Events: events }),
  setTasks: (tasks) => set({ tasks }),
  setRsvps: (rsvps) => set({ rsvps }),
  setArrivals: (arrivals) => set({ arrivals }),
  setActivePage: (page) => set({ activePage: page }),
  setEventDays: (days) => set({ eventDays: days }),
  setNotificationPref: (key, value) =>
    set((state) => ({
      notificationPrefs: { ...state.notificationPrefs, [key]: value },
    })),
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
}));
