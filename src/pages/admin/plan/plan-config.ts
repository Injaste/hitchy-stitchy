// Plan display config — data, not scattered conditionals (mirrors access-config).
// The hook (usePlan) is the gate; this is just how plan limits render.
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

/** Resources marketed as "Unlimited" on Pro — the real cap is a hidden soft
 *  ceiling, so the meter shows "Unlimited" instead of the number. Everything
 *  else (days/pages/members) shows its real number on every tier. */
export const UNLIMITED_ON_PRO: ReadonlySet<PlanResource> = new Set(["guests"]);

/** Gated feature modules → label + the PlanContext.limits flag that unlocks it. */
export const PLAN_FEATURES = [
  { key: "budget", label: "Budget tracker", flag: "canUseBudget" },
  { key: "gifts", label: "Gift envelopes", flag: "canUseGifts" },
] as const;

/** The single seam for "talk to us about my plan" — used when Pro hits its
 *  (fair-use) ceiling, where there's no higher tier to sell. Today a no-friction
 *  mailto built from the app SUPPORT_EMAIL; swap for a dedicated limit-increase
 *  flow later without touching call sites. */
export const planSupportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Hitchy Stitchy — I'd like to increase my plan limits",
)}`;
