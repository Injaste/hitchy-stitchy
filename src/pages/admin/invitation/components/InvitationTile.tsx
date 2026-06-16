import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EventInvitation } from "../types";

interface InvitationTileProps {
  invitation: EventInvitation;
  onEdit: () => void;
}

const InvitationTile = ({ invitation, onEdit }: InvitationTileProps) => (
  <Card variant="interactive" className="h-full overflow-hidden p-0 flex flex-col">
    <div className="relative aspect-4/3 bg-linear-to-b from-primary/20 to-secondary/15 grid place-items-center">
      <span className="font-display text-lg text-foreground/70 px-4 text-center">
        {invitation.name}
      </span>
      <Badge
        variant="outline"
        className={cn(
          "absolute top-3 right-3 text-2xs font-bold uppercase tracking-wide bg-background/80 backdrop-blur-sm",
          invitation.published_at
            ? "text-primary border-primary/30"
            : "text-muted-foreground",
        )}
      >
        {invitation.published_at ? "Live" : "Draft"}
      </Badge>
    </div>
    <div className="p-4 flex flex-col gap-3 flex-1">
      <div className="min-w-0 space-y-0.5">
        <h4 className="text-sm font-medium font-display truncate">
          {invitation.name}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {invitation.template_key} · RSVP {invitation.rsvp_mode}
        </p>
      </div>
      <Button size="sm" onClick={onEdit} className="mt-auto w-full gap-1.5">
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>
    </div>
  </Card>
);

export default InvitationTile;
