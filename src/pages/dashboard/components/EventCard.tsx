import type { FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, ArrowBigRight, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  formatDateRange,
  getDaysUntil,
  getEventStatus,
} from "@/lib/utils/utils-time";
import { itemFadeUp } from "@/lib/animations";
import type { Event } from "../types";
import ArraySeparator from "@/components/custom/array-separator";

const EventCard: FC<{ event: Event }> = ({ event }) => {
  const countdown = getDaysUntil(event.date_start);
  const status = getEventStatus(event.date_start, event.date_end);

  return (
    <motion.div variants={itemFadeUp}>
      <Card variant="interactive" className={`group/event-card cursor-default${status === "past" ? " opacity-50 hover:opacity-100 transition-opacity" : ""}`}>
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover/event-card:bg-primary/15 transition-colors">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          {status === "active" && (
            <Badge variant="secondary" className="capitalize">
              {status}
            </Badge>
          )}
          {status === "upcoming" && (
            <Badge variant="default" className="capitalize">
              {countdown}
            </Badge>
          )}
          {status === "past" && (
            <Badge variant="outline" className="capitalize">
              {countdown}
            </Badge>
          )}
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
            <Link to={`/${event.slug}/admin`} className="flex-1">
              <Button size="sm" className="w-full gap-1.5 group/btn">
                Open suite
                <ArrowBigRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link to={`/${event.slug}`} target="_blank">
              <Button size="sm" variant="outline" className="shrink-0">
                Invitation
                <ExternalLink />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventCard;
