import type { GuestEntry } from "./types";

export async function getGuestPool(): Promise<GuestEntry[]> {
  return [];
}

export async function saveGuestPool(data: GuestEntry[]): Promise<GuestEntry[]> {
  return data;
}
