import {
  format,
  isSameDay,
  isSameYear,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  startOfDay,
  isWithinInterval,
} from "date-fns";
import type { EventStatus } from "../types/types-time";

export function formatDateRange(from: string, to: string): string {
  const start = new Date(from);
  const end = new Date(to);

  if (isSameDay(start, end)) {
    return format(start, "MMM d, yyyy");
  }

  if (isSameYear(start, end)) {
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  }

  return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
}

export function getDaysUntil(dateStr: string): string {
  const today = startOfDay(new Date());
  const target = startOfDay(new Date(dateStr));
  const diff = differenceInDays(target, today);

  if (diff < 0) return "Past";
  if (isToday(target)) return "Today";
  if (isTomorrow(target)) return "Tomorrow";

  if (diff < 30) return `${diff} days away`;

  const months = differenceInMonths(target, today);
  if (months < 12) return `${months} months away`;

  const years = differenceInYears(target, today);
  return `${years} year${years > 1 ? "s" : ""} away`;
}

export function getEventStatus(dateStart: string, dateEnd: string): EventStatus {
  const today = startOfDay(new Date());
  const start = startOfDay(new Date(dateStart));
  const end = startOfDay(new Date(dateEnd));

  if (isWithinInterval(today, { start, end })) return "active";
  if (isFuture(start)) return "upcoming";
  return "past";
}

export function formatTime(time: string, hour24: boolean = false) {
  const split = time.split(":");
  const min = split[1];

  let hour = split[0];
  let ampm = "";

  if (!hour24) {
    const hours = Number(hour);
    const afternoon = hours >= 12 && hours <= 23;
    ampm = afternoon ? " PM" : " AM";
    hour = String(hours % 12 || 12);
  }

  return `${hour}:${min}${ampm}`;
}

export const calculateTimeDuration = (start: string, end: string): string => {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const total = (eh * 60 + em) - (sh * 60 + sm)
  if (total <= 0) return ""
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}