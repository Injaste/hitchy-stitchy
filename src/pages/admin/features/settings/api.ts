import type { EventSettings, RSVPFormConfig, GuestEntry, SettingsData } from "./types";

const DEFAULT_SETTINGS: SettingsData = {
  event: {
    eventName: "Dan & Nad Wedding",
    numberOfDays: 2,
    day1Date: "2025-07-04",
    day2Date: "2025-07-05",
    day1Venue: "Kampung Jawa, Klang",
    day2Venue: "Dewan Serbaguna, Shah Alam",
    rsvpDeadlineEnabled: true,
    rsvpDeadline: "2025-06-20",
  },
  rsvpForm: {
    mode: "open",
    fields: [
      { id: "name", label: "Name", visible: true, required: true },
      { id: "phone", label: "Phone", visible: true, required: false },
      { id: "guestCount", label: "Number of guests", visible: true, required: false },
      { id: "dietary", label: "Dietary notes", visible: true, required: false },
      { id: "meal", label: "Meal choice", visible: false, required: false },
      { id: "message", label: "Special message", visible: true, required: false },
    ],
    confirmationMessage: "Thank you! We can't wait to celebrate with you. 💕",
    minGuests: 1,
    maxGuests: 5,
  },
  guestPool: [],
};

export async function getSettings(): Promise<SettingsData> {
  return DEFAULT_SETTINGS;
}

export async function saveEventSettings(data: EventSettings): Promise<EventSettings> {
  // swap for supabase later
  return data;
}

export async function saveRSVPFormConfig(data: RSVPFormConfig): Promise<RSVPFormConfig> {
  return data;
}

export async function saveGuestPool(data: GuestEntry[]): Promise<GuestEntry[]> {
  return data;
}
