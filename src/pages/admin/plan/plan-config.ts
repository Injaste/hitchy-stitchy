// Plan display config — data, not scattered conditionals (mirrors access-config).
// The hook (usePlan) is the gate; this is just how plan limits render.

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
