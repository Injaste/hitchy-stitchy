import type { FC } from "react";
import { CircleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GuestCapAlertProps {
  /** What this write costs: party sizes summed, counted once per target page. */
  heads: number;
  /** Headroom left on the plan, in the same unit. */
  remaining: number;
}

/**
 * The plan-limit refusal for a batch write. Neutral by law (L7 — limits are
 * money): state both numbers, name the fix, blame nobody. The client can only
 * see the active-guest half of the cap, so the server may still refuse a batch
 * this lets through — its message is shown verbatim when that happens.
 */
const GuestCapAlert: FC<GuestCapAlertProps> = ({ heads, remaining }) => (
  <Alert variant="destructive">
    <CircleAlert />
    <AlertTitle>Over your plan's guest limit</AlertTitle>
    <AlertDescription>
      This adds {heads} guests and your plan has room for {remaining}. Party
      sizes count once for every page they land on. Trim the selection, or
      upgrade your plan to fit them all.
    </AlertDescription>
  </Alert>
);

export default GuestCapAlert;
