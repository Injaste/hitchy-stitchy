import { mockRSVPs } from "@/lib/data";
import type { RSVP } from "./types";

export async function getRSVPs(): Promise<RSVP[]> {
  return mockRSVPs;
}

export async function updateRSVPStatus(
  args: { id: string; status: RSVP["status"] }
): Promise<{ id: string; status: RSVP["status"] }> {
  return args;
}
