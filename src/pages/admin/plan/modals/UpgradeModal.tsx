import { ArrowRight, Check, Sparkles } from "lucide-react";

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
import { cn } from "@/lib/utils";

import { usePlan } from "../../hooks/usePlan";
import {
  PLAN_METERS,
  PLAN_FEATURES,
  PLAN_CAP_LABELS,
  CAP_KEY_FOR,
  planSupportHref,
} from "../plan-config";
import { useUpgradeModalStore } from "../hooks/useUpgradeModalStore";

/** The upgrade surface, opened from the limit-reached banner. Lists the caps that
 *  triggered it, then shows exactly what the NEXT tier changes — features it
 *  unlocks and caps it raises (current → next) — all from the bootstrapped catalog.
 *  No price is shown anywhere (pricing isn't live yet). Three contexts:
 *    top      — already on the highest tier: route to support
 *    over     — content exceeds the current plan (downgrade lock) but a tier up exists
 *    upgrade  — at a cap, a higher tier exists */
const UpgradeModal = () => {
  const { isOpen, close } = useUpgradeModalStore();
  const {
    isOverPlanLimits,
    canUpgrade,
    nextTier,
    meter,
    limits: currentLimits,
    canUseFeature,
  } = usePlan();

  const nextName = nextTier?.name ?? "";

  // What the next tier ADDS vs the current plan — straight from the catalog.
  // (`?.limits/features != null` guards the brief window where the frontend is
  // live but the catalog-enriching migration isn't applied yet.)
  const unlocked =
    nextTier?.features != null
      ? PLAN_FEATURES.filter((f) => nextTier.features[f.key] && !canUseFeature(f.key))
      : [];
  const raised =
    nextTier?.limits != null
      ? PLAN_CAP_LABELS.filter((c) => nextTier.limits[c.key] > currentLimits[c.key]).map(
          (c) => {
            // If this cap has a usage meter, show where you stand (45/50 → 500);
            // otherwise just the cap raise (50 → 500).
            const res = PLAN_METERS.find((m) => CAP_KEY_FOR[m.resource] === c.key)
              ?.resource;
            return {
              label: c.label,
              used: res ? meter(res).used : null,
              atLimit: res ? meter(res).atLimit : false,
              from: currentLimits[c.key],
              to: nextTier.limits[c.key],
            };
          },
        )
      : [];
  const hasDiff = unlocked.length > 0 || raised.length > 0;

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
      description: `See what ${nextName} unlocks for your event.`,
      note: undefined as string | undefined,
    },
  }[state];

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
            {/* One comparison: the metered limits an upgrade raises (with where you
                stand now), then any features it unlocks. */}
            {canUpgrade && hasDiff && (
              <div className="rounded-xl border border-border p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  What {nextName} adds
                </p>

                {raised.length > 0 && (
                  <ul className="divide-y divide-border/60">
                    {raised.map((c) => (
                      <li
                        key={c.label}
                        className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0"
                      >
                        <span className="text-muted-foreground">{c.label}</span>
                        <span className="flex items-center gap-2 tabular-nums">
                          <span
                            className={cn(
                              "font-medium",
                              c.atLimit ? "text-warning" : "text-muted-foreground",
                            )}
                          >
                            {c.used != null ? `${c.used}/${c.from}` : c.from}
                          </span>
                          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/50" />
                          <span className="font-semibold text-foreground">
                            {c.to}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {unlocked.length > 0 && (
                  <ul
                    className={cn(
                      "grid grid-cols-1 gap-2 sm:grid-cols-2",
                      raised.length > 0 && "mt-3 border-t border-border/60 pt-3",
                    )}
                  >
                    {unlocked.map((f) => (
                      <li
                        key={f.key}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="size-3.5 shrink-0 text-primary" />
                        {f.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {copy.note && (
              <p className="text-center text-xs text-muted-foreground/70">
                {copy.note}
              </p>
            )}

            {canUpgrade && (
              <p className="text-center text-xs text-muted-foreground">
                Online upgrades are coming soon.
              </p>
            )}
          </div>
        </DialogBody>

        {canUpgrade ? (
          <DialogFooter>
            <Button className="w-full" disabled>
              Upgrade to {nextName}
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
