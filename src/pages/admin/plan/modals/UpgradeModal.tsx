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
import {
  PLAN_METERS,
  PLAN_FEATURES,
  PLAN_CAP_LABELS,
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
    reachedLimits,
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
          (c) => ({
            label: c.label,
            from: currentLimits[c.key],
            to: nextTier.limits[c.key],
          }),
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
      description: `You've reached your plan's limits. Here's what ${nextName} gives you.`,
      note: undefined as string | undefined,
    },
  }[state];

  const labelFor = (r: (typeof reachedLimits)[number]) =>
    PLAN_METERS.find((m) => m.resource === r)?.label ?? r;

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
            {reachedLimits.length > 0 && (
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
            )}

            {/* What the next tier adds (upgrade case only) */}
            {canUpgrade && hasDiff && (
              <div className="space-y-3 rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-foreground">
                  What {nextName} adds
                </p>

                {unlocked.length > 0 && (
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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

                {raised.length > 0 && (
                  <ul className="space-y-1.5">
                    {raised.map((c) => (
                      <li
                        key={c.label}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-muted-foreground">{c.label}</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {c.from}
                          <span className="mx-1.5 text-muted-foreground">→</span>
                          {c.to}
                        </span>
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
