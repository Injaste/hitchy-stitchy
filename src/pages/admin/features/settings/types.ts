export interface EventSettings {
  eventName: string;
  numberOfDays: 1 | 2;
  day1Date: string;
  day2Date: string;
  day1Venue: string;
  day2Venue: string;
  rsvpDeadlineEnabled: boolean;
  rsvpDeadline: string;
}

export interface RSVPFieldConfig {
  id: string;
  label: string;
  visible: boolean;
  required: boolean;
}

export type RSVPMode = "open" | "pool" | "pool-open";

export interface RSVPFormConfig {
  mode: RSVPMode;
  fields: RSVPFieldConfig[];
  confirmationMessage: string;
  minGuests: number;
  maxGuests: number;
}

export interface GuestEntry {
  id: string;
  name: string;
  phone?: string;
  status: "claimed" | "unclaimed";
}

export interface SettingsData {
  event: EventSettings;
  rsvpForm: RSVPFormConfig;
  guestPool: GuestEntry[];
}
