import { useState } from "react";
import { Sparkles } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/pages/admin/plan/utils";

import { useBespokeModalStore } from "../hooks/useBespokeModalStore";
import { BESPOKE_PRICE } from "../components/bespoke";

/** Intake form for a bespoke (custom-designed) invitation — a one-off paid service,
 *  not a plan flip. The couple describes the brief (style / colours / references);
 *  we design it and deliver it as a private template. Super-admin-only (gated at the
 *  hub card). Submission is wired last (backend RPC → Stripe) — for now the CTA is
 *  honestly marked "coming soon", mirroring UpgradeModal / ActivationModal. */
const BespokeRequestModal = () => {
  const { isOpen, close } = useBespokeModalStore();

  const [style, setStyle] = useState("");
  const [colours, setColours] = useState("");
  const [notes, setNotes] = useState("");

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
            Request a bespoke invitation
          </DialogTitle>
          <DialogDescription>
            Tell us your vision and we'll design a one-of-a-kind invitation just
            for your event.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bespoke-style">Style</Label>
              <Input
                id="bespoke-style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g. Modern minimalist, Traditional Malay"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bespoke-colours">Colours</Label>
              <Input
                id="bespoke-colours"
                value={colours}
                onChange={(e) => setColours(e.target.value)}
                placeholder="e.g. Sage green & gold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bespoke-notes">Reference notes</Label>
              <Textarea
                id="bespoke-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Links or descriptions of any references that inspire you"
              />
            </div>

            <div className="space-y-1 text-center text-xs text-muted-foreground">
              <p>
                A one-off service · {formatPrice(BESPOKE_PRICE)}. We'll review
                your brief and send a proof before anything goes live.
              </p>
              <p>Online payment is being set up — coming soon.</p>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button className="w-full" disabled>
            Request · {formatPrice(BESPOKE_PRICE)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BespokeRequestModal;
