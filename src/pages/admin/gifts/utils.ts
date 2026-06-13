import { Banknote, Coins, Mail, Send, type LucideIcon } from "lucide-react";

import type { Gift, GiftMethod } from "./types";

// How a gift arrived — label + icon. The icon alone distinguishes the method;
// no per-method colour (a tone would imply meaning the data doesn't carry).
export const METHOD_META: Record<
  GiftMethod,
  { label: string; icon: LucideIcon }
> = {
  envelope: { label: "Envelope", icon: Mail },
  cash: { label: "Cash", icon: Banknote },
  transfer: { label: "PayNow", icon: Send },
  others: { label: "Others", icon: Coins },
};

/** Sum of every gift. */
export function grandTotal(gifts: Gift[]): number {
  return gifts.reduce((sum, gift) => sum + gift.amount, 0);
}

/** Gifts received on a given day — gifts carry day_id directly (no bucket). */
export function giftsForDay(gifts: Gift[], dayId: string | null): Gift[] {
  return gifts.filter((gift) => gift.day_id === dayId);
}

/** Newest first — matches the "watch the tally climb" feel and the fetch order. */
export function sortGifts(list: Gift[]): Gift[] {
  return [...list].sort((a, b) => {
    if (a.created_at !== b.created_at)
      return a.created_at < b.created_at ? 1 : -1;
    return a.id < b.id ? 1 : -1;
  });
}

export interface GiftSummary {
  total: number;
  count: number;
  /** total / count, 0 when empty. */
  avg: number;
  largest: number;
  /** Budget total to tally against for the break-even strip; null hides it. */
  costToCover: number | null;
  /** 0..1 of costToCover covered by gifts; 0 when no cost. */
  coverPct: number;
  /** max(0, costToCover − total); null when no cost. */
  toBreakEven: number | null;
}

export function computeGiftSummary(
  gifts: Gift[],
  costToCover: number | null,
): GiftSummary {
  const total = gifts.reduce((sum, gift) => sum + gift.amount, 0);
  const count = gifts.length;
  const largest = gifts.reduce((max, gift) => Math.max(max, gift.amount), 0);

  const clamp = (n: number) => Math.max(0, Math.min(1, n));

  return {
    total,
    count,
    avg: count ? total / count : 0,
    largest,
    costToCover,
    coverPct: costToCover ? clamp(total / costToCover) : 0,
    toBreakEven: costToCover === null ? null : Math.max(0, costToCover - total),
  };
}
