import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Account danger zone — delete account (placeholder until the ownership-cascade
 *  flow is built). Flush (no card) like the other settings-modal sections. */
const AccountDangerSection = () => (
  <div className="space-y-3">
    <div>
      <h4 className="flex items-center gap-2 text-sm font-medium text-destructive">
        <ShieldAlert className="size-4" />
        Delete account
      </h4>
      <p className="mt-1 text-xs text-muted-foreground">
        Permanently delete your account and every event you own. This can't be
        undone.
      </p>
    </div>
    <Button variant="destructive" size="sm" disabled>
      Delete account — coming soon
    </Button>
  </div>
);

export default AccountDangerSection;
