import type { FC } from "react";
import { motion } from "framer-motion";
import { Mail, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateRange, getDaysUntil } from "@/lib/utils/utils-time";
import { cardHover, itemFadeUp } from "@/lib/animations";
import type { Event } from "../types";
import { useClaimInviteMutation } from "../queries";
import ArraySeparator from "@/components/custom/array-separator";

const InvitedCard: FC<{ event: Event }> = ({ event }) => {
  const { mutate: claimInvite, isPending } = useClaimInviteMutation();
  const countdown = getDaysUntil(event.date_start);

  return (
    <motion.div variants={itemFadeUp} whileHover={cardHover}>
      <Card className="group h-full flex flex-col border-dashed hover:border-muted-foreground/30 hover:shadow-md transition-shadow bg-card/30">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-muted-foreground" />
          </div>
          <Badge variant="outline" className="capitalize text-muted-foreground">
            Invited · {countdown}
          </Badge>
        </CardHeader>

        <CardContent className="flex-1 pt-4">
          <h3 className="font-bold text-foreground text-xl leading-snug mb-1">
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
                claimInvite({ eventId: event.id, action: "accept" })
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
                claimInvite({ eventId: event.id, action: "reject" })
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
