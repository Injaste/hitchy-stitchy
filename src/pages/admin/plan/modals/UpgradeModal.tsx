import { useEffect, useState } from "react";
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
import { diffPlan, planSupportHref } from "../plan-config";
import { useUpgradeModalStore } from "../hooks/useUpgradeModalStore";

/** The upgrade surface, opened from the limit-reached banner. When more than one
 *  higher tier is live the user PICKS which to move to; the diff below always shows
 *  what the selected tier adds vs the current plan (features it unlocks + caps it
 *  raises) — all from the bootstrapped catalog. No price is shown (pricing isn't
 *  live yet). Three contexts:
 *    top      — already on the highest tier: route to support
 *    over     — content exceeds the current plan (downgrade lock) but a tier up
 *               exists; tiers the event would STILL overflow are disabled
 *    upgrade  — at a cap, a higher tier exists */
const UpgradeModal = () => {
  const { isOpen, close } = useUpgradeModalStore();
  const {
    planName,
    isOverPlanLimits,
    canUpgrade,
    nextTier,
    upgradeTiers,
    tierFits,
    meter,
    limits: currentLimits,
    canUseFeature,
  } = usePlan();

  const state = !canUpgrade ? "top" : isOverPlanLimits ? "over" : "upgrade";
  const showPicker = canUpgrade && upgradeTiers.length > 1;

  // Default selection: the next tier up — except in the over state, where we open
  // on the cheapest tier that actually fits the event (falling back to next if
  // none do, so the diff still renders something).
  const defaultTier =
    state === "over" ? (upgradeTiers.find(tierFits) ?? nextTier) : nextTier;

  // Picked tier (by key); reset to the default each time the modal opens.
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => {
    if (isOpen) setPicked(null);
  }, [isOpen]);
  const selected =
    (picked ? upgradeTiers.find((t) => t.tier === picked) : null) ?? defaultTier;
  const selectedName = selected?.name ?? "";

  const { unlocked, raised } = selected
    ? diffPlan(selected, currentLimits, canUseFeature, meter)
    : { unlocked: [], raised: [] };
  const hasDiff = unlocked.length > 0 || raised.length > 0;

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
      title: showPicker ? "Choose your plan" : `Upgrade to ${selectedName}`,
      description: showPicker
        ? "You've reached your plan's limits. Pick the plan that fits your event."
        : `See what ${selectedName} unlocks for your event.`,
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
            {/* Tier picker — only when there's a real choice (2+ tiers up). In the
                over state, tiers the event would still overflow are disabled. */}
            {showPicker && (
              <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {/* Current plan — shown for context, not selectable. */}
                <div className="flex items-center justify-between gap-3 rounded-lg border border-dotted border-primary px-3 py-2.5 text-sm">
                  <span className="font-medium text-foreground">
                    {planName}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    Current plan
                  </span>
                </div>
                {upgradeTiers.map((t) => {
                  const fits = state !== "over" || tierFits(t);
                  const active = t.tier === selected?.tier;
                  return (
                    <button
                      key={t.tier}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={!fits}
                      onClick={() => setPicked(t.tier)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                        !fits &&
                          "cursor-not-allowed opacity-50 hover:border-border",
                      )}
                    >
                      <span className="font-medium text-foreground">{t.name}</span>
                      {active ? (
                        <Check className="size-4 shrink-0 text-primary" />
                      ) : !fits ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          Still over limits
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}

            {/* What the selected tier adds vs the current plan: the metered limits
                it raises (with where you stand now), then any features it unlocks. */}
            {canUpgrade && hasDiff && (
              <div className="rounded-xl border border-border p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  What {selectedName} adds
                </p>

                {raised.length > 0 && (
                  <ul className="divide-y divide-border/60">
                    {raised.map((c) => (
                      <li
                        key={c.label}
                        className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0"
                      >
                        <span className="text-muted-foreground">{c.label}</span>
                        {c.from === 0 ? (
                          // Newly unlocked limit (was 0 — the feature didn't exist
                          // before): show just the new cap, no "0 →" comparison.
                          <span className="font-semibold tabular-nums text-foreground">
                            {c.to}
                          </span>
                        ) : (
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
                        )}
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
              Upgrade to {selectedName}
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
