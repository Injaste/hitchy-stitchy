// Calendar helpers shared by every template's anchor calendar drawer.

// Build a JS Date from the public config's event_date ("yyyy-mm-dd") + start time
// ("HH:mm"). Returns null if either is missing.
export function getWeddingDateTime(
  eventDate: string | null | undefined,
  startTime: string | null | undefined,
): Date | null {
  if (!eventDate) return null
  const parts = eventDate.split("-").map(Number)
  if (parts.length < 3 || parts.some(Number.isNaN)) return null
  const [h, m] = (startTime ?? "").split(":").map(Number)
  return new Date(parts[0], parts[1] - 1, parts[2], h || 0, m || 0)
}

// Compact UTC stamp for calendar URLs / .ics (YYYYMMDDTHHMMSSZ).
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")

// Default 1h duration when no explicit end time is configured.
const endOrDefault = (start: Date, end: Date | null) =>
  end && end > start ? end : new Date(start.getTime() + 60 * 60 * 1000)

export function buildGoogleCalendarUrl({
  title,
  start,
  end,
  location,
}: {
  title: string
  start: Date
  end: Date | null
  location?: string | null
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${stamp(start)}/${stamp(endOrDefault(start, end))}`,
  })
  if (location) params.set("location", location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Escape per RFC 5545 (commas, semicolons, backslashes, newlines).
const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n")

export function buildIcs({
  title,
  start,
  end,
  location,
}: {
  title: string
  start: Date
  end: Date | null
  location?: string | null
}): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hitchy Stitchy//Invitation//EN",
    "BEGIN:VEVENT",
    `UID:${stamp(start)}-${Math.random().toString(36).slice(2)}@hitchystitchy`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(endOrDefault(start, end))}`,
    `SUMMARY:${esc(title)}`,
    ...(location ? [`LOCATION:${esc(location)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}

// Inline data: URL for the event. Used as a plain link's href so the OS hands
// it straight to Apple Calendar (Mac/iOS) instead of saving a file — mirroring
// how the Google link opens Google Calendar directly.
export function buildIcsDataUrl(opts: {
  title: string
  start: Date
  end: Date | null
  location?: string | null
}): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(opts))}`
}
