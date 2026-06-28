import type { FC } from "react";
import { Download } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { usePlan } from "../../hooks/usePlan";
import { PLAN_METERS, type PlanResource } from "../../plan/plan-config";
import { useUpgradeModalStore } from "../../plan/hooks/useUpgradeModalStore";

interface Receipt {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
}

/** Real history comes in Phase E from event_purchases via a gated
 *  get_event_purchases read-RPC (the table is service-role only) — never a direct
 *  client select. Empty until then (no placeholder amounts — pricing isn't live). */
const MOCK_RECEIPTS: Receipt[] = [];

/** Settings → Billing. Super-admin-only (gated at the tab). Plan status + usage
 *  + receipts; upgrade routes through the shared UpgradeModal. */
const Billing: FC = () => {
  const { planName, isPaid, isPending, canUpgrade, nextTier } = usePlan();
  const openUpgrade = useUpgradeModalStore((s) => s.open);

  return (
    <div className="grid max-w-2xl gap-4">
      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {planName} plan
            <Badge variant={isPaid ? "default" : "outline"}>{planName}</Badge>
          </CardTitle>
          <CardDescription>
            {isPending
              ? "This event is awaiting payment to activate."
              : `Your event is on the ${planName} plan.`}
          </CardDescription>
          <CardAction>
            <Badge variant={isPending ? "warning" : "success"}>
              {isPending ? "Awaiting payment" : "Active"}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter>
          {isPending ? (
            <Button onClick={openUpgrade}>Complete payment</Button>
          ) : canUpgrade ? (
            <Button onClick={openUpgrade}>
              {nextTier ? `Upgrade to ${nextTier.name}` : "Upgrade"}
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Manage billing · coming soon
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>
            Current usage against your plan's limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {PLAN_METERS.map((m) => (
            <MeterRow key={m.resource} resource={m.resource} label={m.label} />
          ))}
        </CardContent>
      </Card>

      {/* Receipts */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Payment history for this event.</CardDescription>
        </CardHeader>
        <CardContent>
          {MOCK_RECEIPTS.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No invoices yet. Receipts appear here after your first payment.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {MOCK_RECEIPTS.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {r.description}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                  <span className="font-medium text-foreground">
                    {r.amount}
                  </span>
                  <Badge variant="success">{r.status}</Badge>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Download invoice"
                    disabled
                  >
                    <Download className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/** One usage meter — used / max with a fill bar; warning-coloured at the cap.
 *  Every resource has a real cap (no "unlimited"). */
const MeterRow: FC<{ resource: PlanResource; label: string }> = ({
  resource,
  label,
}) => {
  const { meter } = usePlan();
  const m = meter(resource);
  const pct = m.max > 0 ? Math.min(100, Math.round((m.used / m.max) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {m.used} / {m.max}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            m.atLimit ? "bg-warning" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default Billing;
