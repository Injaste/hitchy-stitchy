// Plan display config — labels + tiny ladder helpers (config-as-data). The tier
// ladder and all entitlements come from the DB (bootstrap), never hardcoded here.
import { SUPPORT_EMAIL } from "@/lib/config";

/** Countable resources that get a usage meter. */
export type PlanResource = "guests" | "days" | "pages" | "members";

/** Display labels for the meters, in the order they should appear. */
export const PLAN_METERS: { resource: PlanResource; label: string }[] = [
  { resource: "guests", label: "Guests" },
  { resource: "days", label: "Event days" },
  { resource: "pages", label: "Invitation pages" },
  { resource: "members", label: "Team members" },
];

/** Gated feature modules → display label. Keys match the DB `features` map, in
 *  route order (branding is the non-page perk, last). The booleans come from the
 *  DB — this is only labels. Drives RequirePlan + PlanLockedState + the diff. */
export const PLAN_FEATURES = [
  { key: "timeline", label: "Timeline" },
  { key: "tasks", label: "Task board" },
  { key: "members", label: "Team management" },
  { key: "access", label: "Access groups" },
  { key: "guests", label: "Guest management" },
  { key: "budget", label: "Budget tracker" },
  { key: "gifts", label: "Gift envelopes" },
  { key: "invitation", label: "Invitation" },
  { key: "branding", label: "Remove branding" },
] as const;

/** A gatable feature key — matches the DB features map exactly. */
export type PlanFeature = (typeof PLAN_FEATURES)[number]["key"];

/** Countable cap keys (the limits fields). */
export type PlanCap =
  | "maxGuests"
  | "maxDays"
  | "maxSegmentsPerDay"
  | "maxInvitationPages"
  | "maxMembers"
  | "maxGifts"
  | "maxExpenses";

/** Cap → label, in display order. Drives the "higher limits" upgrade diff. */
export const PLAN_CAP_LABELS: { key: PlanCap; label: string }[] = [
  { key: "maxGuests", label: "Guests" },
  { key: "maxDays", label: "Event days" },
  { key: "maxSegmentsPerDay", label: "Segments / day" },
  { key: "maxInvitationPages", label: "Invitation pages" },
  { key: "maxMembers", label: "Team members" },
  { key: "maxGifts", label: "Gift envelopes" },
  { key: "maxExpenses", label: "Budget expenses" },
];

/** A live tier in the catalog ladder — DB-driven (plans where is_active, ordered
 *  by rank), carrying its caps + features so the client computes the upgrade diff
 *  without a separate fetch. (price is present but not displayed anywhere.) */
export interface PlanTierRow {
  tier: string;
  rank: number;
  name: string;
  price: number | null;
  isFreeTier: boolean;
  limits: Record<PlanCap, number>;
  features: Record<PlanFeature, boolean>;
}

/** Index of a tier in the (rank-ordered) catalog; -1 if it isn't live. */
export const tierIndex = (tier: string, catalog: PlanTierRow[]): number =>
  catalog.findIndex((t) => t.tier === tier);

/** The next tier up the ladder (what checkout sells next), or null at the top /
 *  if the current tier isn't live. */
export const nextTier = (
  tier: string,
  catalog: PlanTierRow[],
): PlanTierRow | null => {
  const i = tierIndex(tier, catalog);
  return i < 0 ? null : (catalog[i + 1] ?? null);
};

/** The single seam for "talk to us about my plan" — used at the top tier, where
 *  there's no higher tier to sell. */
export const planSupportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Hitchy Stitchy — I'd like to increase my plan limits",
)}`;
