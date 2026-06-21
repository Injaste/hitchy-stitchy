import { useState } from "react";
import { Lock } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

import { usePlan } from "../../hooks/usePlan";
import { useAccess } from "../../hooks/useAccess";
import { usePublicPlanQuery } from "../queries";
import { formatPrice } from "../utils";

/** Non-closable gate for an event awaiting payment (activated_at NULL). A 2nd+
 *  event is created pending and stays locked server-side (assert_event_activated)
 *  until checkout activates it. Super admins get the pay CTA; other members see
 *  an awaiting notice. Payment is wired last (Stripe) — the CTA is honestly
 *  marked "coming soon". Reuses the plan price surface, but unlike UpgradeModal
 *  it can't be dismissed (a blocked close shakes the card). */
const ActivationModal = () => {
  const { plan, isPending } = usePlan();
  const { isSuperAdmin } = useAccess();
  // Activation is priced by the event's OWN plan (a pending free event still
  // carries an activation fee), not always Pro.
  const { data: pub } = usePublicPlanQuery(plan.tier, isPending);
  const [animate, setAnimate] = useState<"idle" | "shake">("idle");

  return (
    <Dialog open={isPending}>
      <DialogContent
        showCloseButton={false}
        animate={animate}
        onAnimationComplete={() => setAnimate("idle")}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          setAnimate("shake");
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
          setAnimate("shake");
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="size-4 text-warning" />
            Activate this event
          </DialogTitle>
          <DialogDescription>
            {isSuperAdmin
              ? "This event is awaiting payment. Complete checkout to activate it and unlock editing."
              : "This event is awaiting activation by the organisers — you'll have access once it's set up."}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
              <span className="font-medium text-foreground">
                {plan.name} plan
              </span>
              <Badge variant="warning">Awaiting payment</Badge>
            </div>

            {isSuperAdmin && (
              <p className="text-center text-xs text-muted-foreground">
                Online payment is being set up — coming soon.
              </p>
            )}
          </div>
        </DialogBody>

        {isSuperAdmin && (
          <DialogFooter>
            <Button className="w-full" disabled>
              {pub?.price != null
                ? `Pay ${formatPrice(pub.price)}`
                : "Complete payment"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActivationModal;
