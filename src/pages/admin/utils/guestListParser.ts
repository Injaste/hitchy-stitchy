import type { GuestEntry } from "@/pages/admin/features/settings/types";

export function parseGuestList(raw: string): GuestEntry[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const parts = line.split(",").map((p) => p.trim());
      return {
        id: `guest-${Date.now()}-${i}`,
        name: parts[0] || "Unknown",
        phone: parts[1] || undefined,
        status: "unclaimed" as const,
      };
    });
}
