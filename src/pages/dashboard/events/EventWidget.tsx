import type { FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  formatDateRange,
  getDaysUntil,
  getEventStatus,
} from "@/lib/utils/utils-time";
import { cardHover, itemFadeUp } from "@/lib/animations";

import type { Event } from "../types";

interface EventWidgetProps {
  event: Event;
}

const EventWidget: FC<EventWidgetProps> = ({ event }) => {
  const countdown = getDaysUntil(event.date_start);
  const status = getEventStatus(event.date_start, event.date_end);

  return (
    <motion.div variants={itemFadeUp} whileHover={cardHover}>
      <Card className="group h-full flex flex-col hover:border-primary/20 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>

          {status === "active" && (
            <Badge className="capitalize">{status}</Badge>
          )}
          {status === "upcoming" && (
            <Badge variant="secondary" className="capitalize">
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
          <h3 className="font-serif font-bold text-foreground text-xl leading-snug mb-1">
            {event.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatDateRange(event.date_start, event.date_end)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            /{event.slug}
          </p>

          <div className="flex items-center gap-2 bg-white mt-4">
            <Link to={`/${event.slug}/admin`} className="flex-1">
              <Button size="sm" className="w-full gap-1.5 group/btn">
                Open suite
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link to={`/${event.slug}`}>
              <Button size="sm" variant="outline" className="shrink-0">
                Invitation
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventWidget;
