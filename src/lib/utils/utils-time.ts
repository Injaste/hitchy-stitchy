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

const label = {
  day: {short: "d", long: "day"},
  hour: {short: "h", long: "hour"},
  minute: {short: "m", long: "minute"},
  second: {short: "s", long: "second"}
}

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

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatTimeRange(start: string, end?: string | null): string {
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);
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

const fmt = (value: number, unit: keyof typeof label, format: "short" | "long") => {
  if (value === 0) return ""
  const l = label[unit][format]
  return format === "short" ? `${value}${l}` : `${value} ${l}${value !== 1 ? "s" : ""}`
}

export const calculateTimeDuration = (
  start: string,
  end: string,
  format: "short" | "long" = "short"
): string => {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number)
    return h * 60 + m
  }

  const total = toMinutes(end) - toMinutes(start)
  if (total <= 0) return ""

  const h = Math.floor(total / 60)
  const m = total % 60

  return [fmt(h, "hour", format), fmt(m, "minute", format)]
    .filter(Boolean)
    .join(" ")
}