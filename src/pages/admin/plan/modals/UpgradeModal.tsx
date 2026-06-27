import { useMemo } from "react";
import { AlertTriangle, Check, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { usePlan } from "../../hooks/usePlan";
import { PLAN_METERS, planSupportHref } from "../plan-config";
import { usePublicPlanQuery } from "../queries";
import { useUpgradeModalStore } from "../hooks/useUpgradeModalStore";
import { formatPrice } from "../utils";

/** The pay-to-upgrade surface, opened from the limit-reached banner. Lists the
 *  caps that triggered it, pitches the NEXT tier up (name + price from the DB
 *  catalog), and discloses its price. Three contexts:
 *    top      — already on the highest tier: no upsell, route to support
 *    over     — content exceeds the current plan (downgrade lock) but a tier up exists
 *    upgrade  — at a cap, a higher tier exists
 *  Payment itself is wired last (Stripe) — for now the CTA is honestly marked
 *  "coming soon". Reused later by the pending-activation flow. */
const UpgradeModal = () => {
  const { isOpen, close } = useUpgradeModalStore();
  const { isOverPlanLimits, canUpgrade, nextTier, reachedLimits, meter } =
    usePlan();

  // The next tier's full row (perks: caps + features) — fetched only when needed.
  // Its name + price come from the catalog (nextTier), so they show immediately.
  const { data: target } = usePublicPlanQuery(
    nextTier?.tier ?? "",
    isOpen && canUpgrade,
  );
  const nextName = nextTier?.name ?? "";

  const state = !canUpgrade ? "top" : isOverPlanLimits ? "over" : "upgrade";
  const copy = {
    top: {
      title: "Plan limits reached",
      description:
        "You've reached your plan's limits — we can raise them for you.",
      note: undefined as string | undefined,
    },
    over: {
      title: "Unlock your full event",
      description:
        "Your event has more than your current plan allows, so editing is paused. Your content is safe — upgrade to unlock it all instantly.",
      note: "Prefer to stay put? Remove items to fit your current plan's limits.",
    },
    upgrade: {
      title: `Upgrade to ${nextName}`,
      description: `You've reached your plan's limits. Upgrade to ${nextName} to keep going.`,
      note: undefined as string | undefined,
    },
  }[state];

  const labelFor = (r: (typeof reachedLimits)[number]) =>
    PLAN_METERS.find((m) => m.resource === r)?.label ?? r;

  const perks = useMemo(() => {
    if (!target) return [];
    const items = [
      `Up to ${target.maxGuests} guests`,
      `Up to ${target.maxDays} event days`,
      `Up to ${target.maxSegmentsPerDay} segments per day`,
      `Up to ${target.maxInvitationPages} invitation pages`,
      `Up to ${target.maxMembers} team members`,
    ];
    if (target.canUseBudget) items.push("Budget tracker");
    if (target.canUseGifts) items.push("Gift envelopes");
    if (target.canRemoveBranding) items.push("Remove Hitchy Stitchy branding");
    return items;
  }, [target]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) close();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            {copy.title}
          </DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            {/* What's capped right now */}
            <div className="space-y-2">
              {reachedLimits.map((r) => {
                const m = meter(r);
                return (
                  <div
                    key={r}
                    className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm"
                  >
                    <AlertTriangle className="size-3.5 shrink-0 text-warning" />
                    <span className="font-medium text-foreground">
                      {labelFor(r)}
                    </span>
                    <span className="ml-auto font-semibold text-warning">
                      {m.used}/{m.max}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* The next-tier pitch (upgrade case only) */}
            {canUpgrade && perks.length > 0 && (
              <div className="rounded-xl border border-border p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  What you get with {nextName}
                </p>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {perks.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="size-3.5 shrink-0 text-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {copy.note && (
              <p className="text-center text-xs text-muted-foreground/70">
                {copy.note}
              </p>
            )}

            {canUpgrade && (
              <p className="text-center text-xs text-muted-foreground">
                {nextTier?.price != null
                  ? "Online payment is being set up — coming soon."
                  : "Pricing coming soon."}
              </p>
            )}
          </div>
        </DialogBody>

        {canUpgrade ? (
          <DialogFooter>
            <Button className="w-full" disabled>
              {nextTier?.price != null
                ? `Upgrade · ${formatPrice(nextTier.price)}`
                : `Upgrade to ${nextName}`}
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter>
            <Button asChild className="w-full">
              <a href={planSupportHref} target="_blank" rel="noopener noreferrer">
                Contact us
              </a>
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
