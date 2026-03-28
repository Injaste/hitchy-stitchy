import type { RSVPFormData } from "./types";

const STORAGE_KEY = "wedding_rsvp_data";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const submitMockRsvp = async (data: RSVPFormData): Promise<RSVPFormData> => {
  await delay(1000);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
};

export const fetchMockRsvp = async (): Promise<RSVPFormData | null> => {
  await delay(1000);
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const deleteMockRsvp = async (): Promise<void> => {
  await delay(1000);
  localStorage.removeItem(STORAGE_KEY);
};
