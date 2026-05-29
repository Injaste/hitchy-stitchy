import type { FC } from "react";
import { motion } from "framer-motion";
import { Mail, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateRange, getDaysUntil, getEventStatus } from "@/lib/utils/utils-time";
import { itemFadeUp } from "@/lib/animations";
import type { Event } from "../types";
import { useClaimInviteMutation } from "../queries";
import ArraySeparator from "@/components/custom/array-separator";

const InvitedCard: FC<{ event: Event }> = ({ event }) => {
  const { mutate: claimInvite, isPending } = useClaimInviteMutation();
  const countdown = getDaysUntil(event.date_start);
  const status = getEventStatus(event.date_start, event.date_end);

  return (
    <motion.div variants={itemFadeUp}>
      <Card variant="interactive" className={`group/invited-card cursor-default${status === "past" ? " opacity-50 hover:opacity-100 transition-opacity" : ""}`}>
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover/invited-card:bg-secondary/15 transition-colors">
            <Mail className="w-5 h-5 text-muted-foreground" />
          </div>
          <Badge variant="outline" className="capitalize text-muted-foreground">
            {status === "past" ? "Invited" : `Invited · ${countdown}`}
          </Badge>
        </CardHeader>

        <CardContent className="flex-1 pt-4">
          <h3 className="font-bold text-foreground text-xl leading-snug mb-1 truncate">
            {event.name}
          </h3>
          <ArraySeparator
            items={formatDateRange(event.date_start, event.date_end)}
            separator="-"
            className="text-muted-foreground gap-1"
          />
          <p className="text-xs text-muted-foreground mt-1">/{event.slug}</p>

          <div className="flex items-center gap-2 mt-4">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 gap-1.5"
              onClick={() =>
                claimInvite({
                  event_id: event.id,
                  event_name: event.name,
                  action: "accept",
                })
              }
              disabled={isPending}
            >
              <Check className="w-3.5 h-3.5" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5"
              onClick={() =>
                claimInvite({
                  event_id: event.id,
                  event_name: event.name,
                  action: "reject",
                })
              }
              disabled={isPending}
            >
              <X className="w-3.5 h-3.5" />
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InvitedCard;
