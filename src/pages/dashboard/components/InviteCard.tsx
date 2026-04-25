import type { FC } from "react";
import { motion } from "framer-motion";
import { MailOpen, ArrowRight, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { formatDateRange } from "@/lib/utils/utils-time";
import { itemFadeUp, cardHover } from "@/lib/animations";

import type { PendingInvite } from "../types";
import { useAcceptInviteMutation, useRejectInviteMutation } from "../queries";

interface InviteCardProps {
  invite: PendingInvite;
}

const InviteCard: FC<InviteCardProps> = ({ invite }) => {
  const { mutate: accept, isPending: accepting } = useAcceptInviteMutation();
  const { mutate: reject, isPending: rejecting } = useRejectInviteMutation();

  const isPending = accepting || rejecting;

  return (
    <motion.div variants={itemFadeUp} whileHover={cardHover}>
      <Card className="group h-full flex flex-col border-dashed hover:border-primary/20 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <MailOpen className="w-5 h-5 text-muted-foreground" />
          </div>
          <Badge variant="secondary" className="shrink-0">
            Pending invite
          </Badge>
        </CardHeader>

        <CardContent className="flex-1 pt-4 flex flex-col">
          <h3 className="font-bold text-foreground text-xl leading-snug mb-1">
            {invite.event_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatDateRange(invite.date_start, invite.date_end)}
          </p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {invite.role_name && (
              <Badge variant="outline" className="text-xs">
                {invite.role_name}
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              as {invite.display_name}
            </p>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            Invited{" "}
            {formatDistanceToNow(new Date(invite.invited_at), {
              addSuffix: true,
            })}
          </p>

          <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">
            <Button
              size="sm"
              className="flex-1 gap-1.5 group/btn"
              onClick={() => accept(invite.id)}
              disabled={isPending}
            >
              Accept
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => reject(invite.id)}
              disabled={isPending}
              aria-label="Decline invite"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InviteCard;
