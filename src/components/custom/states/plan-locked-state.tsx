import { Lock, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PLAN_FEATURES,
  type PlanFeature,
} from "@/pages/admin/plan/plan-config";
import { FEATURE_META } from "@/pages/admin/plan/feature-meta";
import { useUpgradeModalStore } from "@/pages/admin/plan/hooks/useUpgradeModalStore";

/** Upsell shown by RequirePlan when the event's plan doesn't include a feature.
 *  Only super admins reach this (the gated routes also require super admin), so
 *  it keeps the "plan UI is super-admin-only" rule. Opens the shared UpgradeModal. */
const PlanLockedState = ({ feature }: { feature: PlanFeature }) => {
  const openUpgrade = useUpgradeModalStore((s) => s.open);
  const label =
    PLAN_FEATURES.find((f) => f.key === feature)?.label ?? "This feature";
  const { icon: Icon, description } = FEATURE_META[feature];

  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* The feature's own icon, with a small lock badge to signal it's gated. */}
        <div className="relative mb-6">
          <div className="flex size-20 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 to-primary/5">
            <Icon className="size-9 text-primary" />
          </div>
          <span className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full border border-border bg-background shadow-sm">
            <Lock className="size-3.5 text-muted-foreground" />
          </span>
        </div>

        <h2 className="text-xl font-bold text-foreground">{label}</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-5 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          Included on a higher plan
        </div>

        <Button
          className="mt-6"
          onClick={() => openUpgrade({ kind: "feature", feature })}
        >
          Upgrade plan
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanLockedState;
