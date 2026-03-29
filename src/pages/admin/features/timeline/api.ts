import type { TimelineEvent } from "./types";

export async function getDay1Events(): Promise<TimelineEvent[]> {
  return [];
}

export async function getDay2Events(): Promise<TimelineEvent[]> {
  return [];
}

export async function createEvent(event: Omit<TimelineEvent, "id">): Promise<TimelineEvent> {
  return { ...event, id: `evt-${Date.now()}` };
}

export async function updateEvent(event: TimelineEvent): Promise<TimelineEvent> {
  return event;
}

export async function deleteEvent(id: string): Promise<string> {
  return id;
}
