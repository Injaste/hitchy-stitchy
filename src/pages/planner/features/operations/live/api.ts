import type { LogEntry } from "./types";

export async function getLogs(): Promise<LogEntry[]> {
  return [];
}

export async function addLog(entry: Omit<LogEntry, "id">): Promise<LogEntry> {
  return { ...entry, id: Date.now() };
}

export async function getArrivals(): Promise<Record<string, boolean>> {
  return {};
}

export async function markArrived(role: string): Promise<string> {
  return role;
}
