/** Convert "07:00 AM" → "07:00" (24-hour for <input type="time">) */
export function to24h(display: string): string {
  if (!display) return "";
  const match = display.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return display;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === "AM" && hours === 12) hours = 0;
  if (period === "PM" && hours !== 12) hours += 12;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

/** Convert "07:00" (24-hour) → "07:00 AM" */
export function to12h(value: string): string {
  if (!value) return "";
  const [hStr, mStr] = value.split(":");
  let hours = parseInt(hStr, 10);
  const minutes = mStr;
  const period = hours >= 12 ? "PM" : "AM";
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
}
