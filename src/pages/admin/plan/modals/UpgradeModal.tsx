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
import { PLAN_METERS } from "../plan-config";
import { useProPlanQuery } from "../queries";
import { useUpgradeModalStore } from "../hooks/useUpgradeModalStore";

/** Singapore display price. Drops the trailing .00 for whole amounts. */
const formatPrice = (price: number) =>
  `S$${price % 1 === 0 ? price : price.toFixed(2)}`;

/** The pay-to-upgrade surface, opened from the limit-reached banner. Lists the
 *  caps that triggered it, pitches Pro, and discloses the price. Payment itself
 *  is wired last (Stripe) — for now the CTA is honestly marked "coming soon".
 *  Reused later by the pending-activation flow. */
const UpgradeModal = () => {
  const { isOpen, close } = useUpgradeModalStore();
  const { isPro, reachedLimits, meter } = usePlan();

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
            {isPro ? "Plan limits reached" : "Upgrade to Pro"}
          </DialogTitle>
          <DialogDescription>
            {isPro
              ? "You've reached the limits of your Pro plan."
              : "You've reached your Free plan limits. Upgrade to keep going."}
          </DialogDescription>
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

            <p className="text-center text-xs text-muted-foreground">
              {isPro
                ? "Need higher limits? Reach out and we'll help."
                : pro?.price != null
                  ? "Online payment is being set up — coming soon."
                  : "Pricing coming soon."}
            </p>
          </div>
        </DialogBody>

        {isPro ? (
          <DialogFooter showCloseButton />
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
