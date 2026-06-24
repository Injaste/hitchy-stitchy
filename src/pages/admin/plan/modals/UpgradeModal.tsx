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
import { useProPlanQuery } from "../queries";
import { useUpgradeModalStore } from "../hooks/useUpgradeModalStore";
import { formatPrice } from "../utils";

/** Per-state copy for the three upgrade contexts — keeps the JSX free of nested
 *  ternaries: pick the state, render COPY[state]. `note` is the muted secondary
 *  line (only the over-limit state has one). */
type UpgradeState = "pro" | "over" | "free";
const COPY: Record<
  UpgradeState,
  { title: string; description: string; note?: string }
> = {
  pro: {
    title: "Plan limits reached",
    description:
      "You've reached your Pro plan's limits — we can raise them for you.",
  },
  over: {
    title: "Unlock your full event",
    description:
      "Your event has more than the Free plan allows, so editing is paused. Your content is safe — upgrade to unlock it all instantly.",
    note: "Staying on Free? You can remove items to fit within its limits.",
  },
  free: {
    title: "Upgrade to Pro",
    description: "You've reached your Free plan limits. Upgrade to keep going.",
  },
};

/** The pay-to-upgrade surface, opened from the limit-reached banner. Lists the
 *  caps that triggered it, pitches Pro, and discloses the price. Payment itself
 *  is wired last (Stripe) — for now the CTA is honestly marked "coming soon".
 *  Reused later by the pending-activation flow. */
const UpgradeModal = () => {
  const { isOpen, close } = useUpgradeModalStore();
  const { isPro, isOverPlanLimits, reachedLimits, meter } = usePlan();
  // Over the plan = a downgrade that locks editing (different pitch than just
  // being at a cap). Only meaningful for Free — Pro over-limit has no higher tier.
  const over = isOverPlanLimits && !isPro;
  const copy = COPY[isPro ? "pro" : over ? "over" : "free"];

  // Only fetch the Pro catalog row when the modal is open and an upgrade applies.
  const { data: pro } = useProPlanQuery(isOpen && !isPro);

  const labelFor = (r: (typeof reachedLimits)[number]) =>
    PLAN_METERS.find((m) => m.resource === r)?.label ?? r;

  const perks = useMemo(() => {
    if (!pro) return [];
    const items = [
      "Unlimited guests",
      `Up to ${pro.maxDays} event days`,
      `Up to ${pro.maxInvitationPages} invitation pages`,
      `Up to ${pro.maxMembers} team members`,
    ];
    if (pro.canUseBudget) items.push("Budget tracker");
    if (pro.canUseGifts) items.push("Gift envelopes");
    if (pro.canRemoveBranding) items.push("Remove Hitchy Stitchy branding");
    return items;
  }, [pro]);

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

            {/* The Pro pitch (upgrade case only) */}
            {!isPro && perks.length > 0 && (
              <div className="rounded-xl border border-border p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  What you get with Pro
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

            {!isPro && (
              <p className="text-center text-xs text-muted-foreground">
                {pro?.price != null
                  ? "Online payment is being set up — coming soon."
                  : "Pricing coming soon."}
              </p>
            )}
          </div>
        </DialogBody>

        {isPro ? (
          <DialogFooter>
            <Button asChild className="w-full">
              <a href={planSupportHref} target="_blank" rel="noopener noreferrer">
                Contact us
              </a>
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter>
            <Button className="w-full" disabled>
              {pro?.price != null
                ? `Upgrade · ${formatPrice(pro.price)}`
                : "Upgrade to Pro"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
