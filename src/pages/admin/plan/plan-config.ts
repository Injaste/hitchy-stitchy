// Plan display config — data, not scattered conditionals (mirrors access-config).
// The hook (usePlan) is the gate; this is just how plan limits render.
import { SUPPORT_EMAIL } from "@/lib/config";

/** Plan tiers LIVE in the app, ascending — the array index is the rank. Gating
 *  is "rank >= required"; an upgrade steps to the next entry. Features are
 *  flag-driven (canUse*), so a tier is data, not new branches.
 *
 *  Paid tiers exist in the backend catalog but stay hidden from the frontend
 *  until each is built + priced — add it back here (ascending order) to switch on
 *  its upgrade path. Full backend ladder: ["free", "pro", "advanced"]. */
export const PLAN_TIERS = ["free"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

/** Rank of a tier (0 = free). A tier not currently live in the app ranks -1. */
export const tierRank = (tier: string): number =>
  PLAN_TIERS.indexOf(tier as PlanTier);

/** The tier one step up (what checkout sells next), or null at the top tier /
 *  for a tier that isn't currently live. */
export const nextTier = (tier: string): PlanTier | null => {
  const i = tierRank(tier);
  return i < 0 ? null : (PLAN_TIERS[i + 1] ?? null);
};

/** Title-cased label for a tier string. The catalog `name` is the source of
 *  truth where a plan row is loaded; this is for labels that don't fetch one. */
export const tierLabel = (tier: string): string =>
  tier.charAt(0).toUpperCase() + tier.slice(1);

/** Countable resources that get a usage meter. */
export type PlanResource = "guests" | "days" | "pages" | "members";

/** Display labels for the meters, in the order they should appear. */
export const PLAN_METERS: { resource: PlanResource; label: string }[] = [
  { resource: "guests", label: "Guests" },
  { resource: "days", label: "Event days" },
  { resource: "pages", label: "Invitation pages" },
  { resource: "members", label: "Team members" },
];

/** Resources marketed as "Unlimited" on paid tiers — the real cap is a hidden
 *  soft ceiling, so the meter shows "Unlimited" instead of the number. Everything
 *  else (days/pages/members) shows its real number on every tier. */
export const UNLIMITED_ON_PAID: ReadonlySet<PlanResource> = new Set(["guests"]);

/** Gated feature modules → label + the PlanContext.limits flag that unlocks it. */
export const PLAN_FEATURES = [
  { key: "budget", label: "Budget tracker", flag: "canUseBudget" },
  { key: "gifts", label: "Gift envelopes", flag: "canUseGifts" },
] as const;

/** A gatable feature module key ("budget" | "gifts") — drives RequirePlan. */
export type PlanFeature = (typeof PLAN_FEATURES)[number]["key"];

/** The single seam for "talk to us about my plan" — used when Pro hits its
 *  (fair-use) ceiling, where there's no higher tier to sell. Today a no-friction
 *  mailto built from the app SUPPORT_EMAIL; swap for a dedicated limit-increase
 *  flow later without touching call sites. */
export const planSupportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Hitchy Stitchy — I'd like to increase my plan limits",
)}`;
