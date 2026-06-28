import {
  Lock,
  Sparkles,
  Clock,
  CheckSquare,
  Users,
  Shield,
  Mail,
  ClipboardList,
  Wallet,
  HandCoins,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLAN_FEATURES, type PlanFeature } from "@/pages/admin/plan/plan-config";
import { useUpgradeModalStore } from "@/pages/admin/plan/hooks/useUpgradeModalStore";

/** Per-feature icon (mirrors the sidebar) + a one-line "what it does", so the
 *  locked page shows the feature's identity and value, not a generic mark. */
const FEATURE_META: Record<PlanFeature, { icon: LucideIcon; description: string }> =
  {
    timeline: {
      icon: Clock,
      description:
        "Map every cue — prep, ceremony, celebration — then run the day live as your whole team follows along.",
    },
    tasks: {
      icon: CheckSquare,
      description:
        "Track who's doing what across To do, In progress and Done, with priorities and assignees.",
    },
    members: {
      icon: Users,
      description:
        "Invite your party, vendors and coordinators — each with a clear role and just the access they need.",
    },
    access: {
      icon: Shield,
      description:
        "Fine-grained roles — decide exactly who can view and edit each part of your event.",
    },
    guests: {
      icon: ClipboardList,
      description:
        "Collect RSVPs and manage your full guest list, all in one place.",
    },
    budget: {
      icon: Wallet,
      description:
        "Log every expense and vendor, and track what's paid versus still due.",
    },
    gifts: {
      icon: HandCoins,
      description:
        "Record every ang bao, sampul duit or shagun — the tally adds up as the day goes on.",
    },
    invitation: {
      icon: Mail,
      description:
        "Design the pages your guests open and RSVP through, one per event day.",
    },
    branding: {
      icon: Crown,
      description:
        "Remove Hitchy Stitchy branding from your guest-facing invitation pages.",
    },
  };

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

        <Button className="mt-6" onClick={openUpgrade}>
          Upgrade plan
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanLockedState;
