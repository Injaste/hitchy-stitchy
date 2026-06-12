/**
 * Display name for a day: its label, else a positional "Day N" (1-based). The
 * canonical day name across every day-bounded feature (timeline, budget, …) —
 * reuse rather than re-deriving the fallback.
 */
export function dayLabel(
  label: string | null | undefined,
  index: number,
): string {
  return label?.trim() || `Day ${index + 1}`;
}
