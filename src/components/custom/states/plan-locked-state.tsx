import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLAN_FEATURES, type PlanFeature } from "@/pages/admin/plan/plan-config";
import { useUpgradeModalStore } from "@/pages/admin/plan/hooks/useUpgradeModalStore";

/** Upsell shown by RequirePlan when the event's plan doesn't include a feature.
 *  Only super admins reach this (the gated routes also require super admin), so
 *  it keeps the "plan UI is super-admin-only" rule. Opens the shared UpgradeModal. */
const PlanLockedState = ({ feature }: { feature: PlanFeature }) => {
  const openUpgrade = useUpgradeModalStore((s) => s.open);
  const label =
    PLAN_FEATURES.find((f) => f.key === feature)?.label ?? "This feature";

  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="flex flex-col items-center justify-center text-center py-24 px-6">
        <div className="w-20 h-20 rounded-full bg-muted border border-primary/20 flex items-center justify-center mb-6">
          <Sparkles className="w-9 h-9 text-primary" />
        </div>
        <h2 className="font-bold text-2xl text-foreground mb-2 uppercase">
          {label}
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-6">
          {label} is available on a higher plan.
          <br />
          Upgrade to unlock it for this event.
        </p>
        <Button onClick={openUpgrade}>Upgrade plan</Button>
      </CardContent>
    </Card>
  );
};

export default PlanLockedState;
