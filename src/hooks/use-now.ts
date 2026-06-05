import { useEffect, useState } from "react";

export function useNow(intervalMs: number | null = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // `null` disables ticking entirely (e.g. a closed modal — no point running).
    if (intervalMs == null) return;
    // Refresh on (re)enable so the value is current the moment it's needed,
    // not a tick later.
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

const HOUR_MS = 3_600_000;

/**
 * Like {@link useNow}, but adaptive: ticks every second when `targetMs` is
 * within an hour (past or future), otherwise every minute. Pass the moment the
 * UI counts toward (e.g. a scheduled start/end); `null` keeps the slow cadence.
 * Cheap by design — only the few items near their moment ever tick per-second.
 */
export function useAdaptiveNow(targetMs: number | null = 1_000): Date {
  const near = targetMs != null && Math.abs(targetMs - Date.now()) < HOUR_MS;
  return useNow(near ? 1_000 : 60_000);
}
