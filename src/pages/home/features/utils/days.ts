export function dayLabel(label: string | null | undefined, index: number): string {
  return label?.trim() || `Day ${index + 1}`;
}
