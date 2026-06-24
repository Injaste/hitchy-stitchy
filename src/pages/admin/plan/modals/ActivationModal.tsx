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
import { usePublicPlanQuery } from "../queries";
import { formatPrice } from "../utils";

/** Non-closable gate for an event awaiting payment (activated_at IS NULL). A 2nd+
 *  event is created pending and stays locked server-side (assert_event_activated)
 *  until checkout activates it. Super-admin-only (gated at PlanModals, so members
 *  never see any plan UI). Payment is wired last (Stripe) - the CTA is honestly
 *  marked "coming soon". Reuses the plan price surface, but unlike UpgradeModal
 *  it can't be dismissed (a blocked close shakes the card). */
const ActivationModal = () => {
  const { planName, planTier, isPending } = usePlan();
  // Activation is priced by the event's OWN plan (a pending free event still
  // carries an activation fee), not always Pro.
  const { data: pub } = usePublicPlanQuery(planTier, isPending);
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
            This event is awaiting payment. Complete checkout to activate it and
            unlock editing.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
              <span className="font-medium text-foreground">
                {planName} plan
              </span>
              <Badge variant="warning">Awaiting payment</Badge>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Online payment is being set up - coming soon.
            </p>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button className="w-full" disabled>
            {pub?.price != null
              ? `Pay ${formatPrice(pub.price)}`
              : "Complete payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActivationModal;
