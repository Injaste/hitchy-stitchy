import { format } from "date-fns";

function formatGCal(d: Date): string {
  return format(d, "yyyyMMdd'T'HHmmss'Z'");
}

interface GoogleCalendarParams {
  name: string;
  dateStart: Date;
  dateEnd: Date;
  venueAddress: string;
}

export function buildGoogleCalendarUrl({
  name,
  dateStart,
  dateEnd,
  venueAddress,
}: GoogleCalendarParams): string {
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" +
    encodeURIComponent(name) +
    "&dates=" +
    encodeURIComponent(`${formatGCal(dateStart)}/${formatGCal(dateEnd)}`) +
    "&location=" +
    encodeURIComponent(venueAddress)
  );
}
