import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/pages/admin/plan/utils";
import { useBespokeModalStore } from "../hooks/useBespokeModalStore";
import { BESPOKE_TITLE, BESPOKE_BLURB, BESPOKE_PRICE, bespokeSurface } from "./bespoke";

// Hub grid tile for the bespoke service — mirrors InvitationCard's anatomy (icon
// top-left, badge top-right, title → blurb → meta line, bottom button row) so it
// reads as a sibling of the real invitation pages, just marked as the add-on
// (dashed primary + gradient surface). Opens the brief modal. Super-admin-only
// (gated by the hub).
const BespokeInvitationCard = () => {
  const { open } = useBespokeModalStore();

  return (
    <Card
      variant="interactive"
      onClick={open}
      className={cn("group/bespoke-card", bespokeSurface)}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary transition-colors group-hover/bespoke-card:bg-primary/15">
          <Sparkles className="w-5 h-5" />
        </div>
        <Badge variant="outline" className="capitalize">
          Custom
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-4">
        <h3 className="font-display font-bold text-foreground text-xl leading-snug mb-1">
          {BESPOKE_TITLE}
        </h3>
        <p className="text-sm text-muted-foreground">{BESPOKE_BLURB}</p>
        <p className="text-xs text-muted-foreground mt-1">
          One-off · {formatPrice(BESPOKE_PRICE)}
        </p>
        <div className="flex items-center gap-2 mt-auto pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={open}
            className="flex-1 gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Request a design
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BespokeInvitationCard;
