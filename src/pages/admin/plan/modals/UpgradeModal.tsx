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
import {
  diffPlan,
  planSupportHref,
  CAP_KEY_FOR,
  PLAN_FEATURES,
  type PlanTierRow,
} from "../plan-config";
import { FEATURE_META } from "../feature-meta";
import { useUpgradeModalStore } from "../hooks/useUpgradeModalStore";

/** The upgrade surface, opened from the limit-reached banner. When more than one
 *  higher tier is live the user PICKS which to move to; the diff below always shows
 *  what the selected tier adds vs the current plan (features it unlocks + caps it
 *  raises) — all from the bootstrapped catalog. No price is shown (pricing isn't
 *  live yet). Three contexts:
 *    top      — already on the highest tier: route to support
 *    over     — content exceeds the current plan (downgrade lock) but a tier up
 *               exists; every higher tier stays selectable so they can see it all
 *    upgrade  — at a cap, a higher tier exists */
const UpgradeModal = () => {
  const { isOpen, close, trigger } = useUpgradeModalStore();
  const {
    planName,
    isOverPlanLimits,
    canUpgrade,
    nextTier,
    upgradeTiers,
    meter,
    limits: currentLimits,
    canUseFeature,
  } = usePlan();

  const state = !canUpgrade ? "top" : isOverPlanLimits ? "over" : "upgrade";
  const showPicker = canUpgrade && upgradeTiers.length > 1;

  // Does a target tier actually RELIEVE what opened the modal? — the feature it's
  // missing now, or a cap below where the event already is. Lets us default to the
  // cheapest tier that helps instead of blindly the next rank up (Starter's next is
  // Plus, which adds neither the suite nor more days/pages).
  const tierRelieves = (t: PlanTierRow): boolean => {
    if (!trigger) return false;
    if (trigger.kind === "feature") return !!t.features?.[trigger.feature];
    const cap = CAP_KEY_FOR[trigger.resource];
    return t.limits != null && t.limits[cap] > currentLimits[cap];
  };

  // Default selection: with a trigger, the cheapest tier that relieves it;
  // otherwise the next tier up. (upgradeTiers is rank-ordered, so find() returns
  // the cheapest match; fall back to nextTier so the diff always renders something.)
  const defaultTier = trigger
    ? (upgradeTiers.find(tierRelieves) ?? nextTier)
    : nextTier;

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

  // When opened from a locked feature, lead with unlocking THAT feature rather
  // than the generic "you've reached a limit" framing (which was wrong here).
  const triggerFeatureLabel =
    trigger?.kind === "feature"
      ? (PLAN_FEATURES.find((f) => f.key === trigger.feature)?.label ??
        "this feature")
      : null;

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
    upgrade: triggerFeatureLabel
      ? {
          title: `Unlock ${triggerFeatureLabel}`,
          description: showPicker
            ? `${triggerFeatureLabel} is included on the plans below — pick the one that fits your event.`
            : `${triggerFeatureLabel} is included on ${selectedName}.`,
          note: undefined as string | undefined,
        }
      : {
          title: showPicker ? "Choose your plan" : `Upgrade to ${selectedName}`,
          description: showPicker
            ? "You've reached your plan's limits. Pick the plan that fits your event."
            : `See what ${selectedName} unlocks for your event.`,
          note: undefined as string | undefined,
        },
  }[state];

  // The two halves of the diff, rendered in trigger order: a feature lock leads
  // with what it UNLOCKS (the thing they clicked), a cap hit leads with the extra
  // ROOM — so the most relevant, enticing part sits above the fold either way.
  const roomBlock =
    raised.length > 0 ? (
      <>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          More room
        </p>
        <ul className="space-y-2">
          {raised.map((c) => (
            <li
              key={c.label}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-muted-foreground">{c.label}</span>
              {c.from === 0 ? (
                // Newly unlocked cap (was 0 — didn't exist before): just the new
                // number, no "0 →" comparison.
                <span className="text-base font-bold tabular-nums text-primary">
                  {c.to}
                </span>
              ) : (
                <span className="flex items-baseline gap-2 tabular-nums">
                  <span
                    className={cn(
                      "text-xs",
                      c.atLimit
                        ? "font-semibold text-warning"
                        : "text-muted-foreground/70",
                    )}
                  >
                    {c.used != null ? `${c.used}/${c.from}` : c.from}
                  </span>
                  <ArrowRight className="size-3 shrink-0 self-center text-primary/50" />
                  <span className="text-base font-bold tabular-nums text-primary">
                    {c.to}
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </>
    ) : null;

  const unlocksBlock =
    unlocked.length > 0 ? (
      <>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Unlocks
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {unlocked.map((f) => {
            const Icon = FEATURE_META[f.key].icon;
            return (
              <li
                key={f.key}
                className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background p-2.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {f.label}
                </span>
              </li>
            );
          })}
        </ul>
      </>
    ) : null;

  const diffBlocks = (
    trigger?.kind === "feature"
      ? [
          { id: "unlocks", node: unlocksBlock },
          { id: "room", node: roomBlock },
        ]
      : [
          { id: "room", node: roomBlock },
          { id: "unlocks", node: unlocksBlock },
        ]
  ).filter((b) => b.node);

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
            {/* Tier picker — only when there's a real choice (2+ tiers up). Every
                higher tier stays selectable, even when over limits, so they can
                see what each unlocks. */}
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
                  const active = t.tier === selected?.tier;
                  return (
                    <button
                      key={t.tier}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setPicked(t.tier)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="font-medium text-foreground">{t.name}</span>
                      {active && (
                        <Check className="size-4 shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* What the selected tier adds vs the current plan — the limits it
                raises (new number led) and the features it unlocks (icon tiles, a
                showcase not a checklist), ordered so the trigger's match is first. */}
            {canUpgrade && hasDiff && (
              <div className="space-y-4 rounded-xl border border-border bg-card p-4">
                {diffBlocks.map((b, i) => (
                  <div
                    key={b.id}
                    className={cn(i > 0 && "border-t border-border/60 pt-4")}
                  >
                    {b.node}
                  </div>
                ))}
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
