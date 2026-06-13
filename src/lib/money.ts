// Shared SGD money formatting. Used across the admin money features (budget,
// gift envelopes) so "how SGD renders" lives in one place.

const numFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** "S$12,000" — SGD, no cents (wedding amounts are whole). */
export function formatSGD(n: number): string {
  return `S$${numFmt.format(Math.round(n))}`;
}

/** "12,000" — bare grouped number, for tight cells. */
export function formatNum(n: number): string {
  return numFmt.format(Math.round(n));
}
