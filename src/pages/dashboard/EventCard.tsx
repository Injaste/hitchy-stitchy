import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserEvent } from "./types";

interface EventCardProps {
  event: UserEvent;
}

function formatDateRange(from: string, to: string): string {
  const start = new Date(from);
  const end = new Date(to);

  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtShort = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth() && start.getDate() === end.getDate()) {
      return fmt.format(start);
    }
    return `${fmtShort.format(start)} – ${fmt.format(end)}`;
  }
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

function getDaysUntil(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return "Past";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 30) return `${diff} days away`;
  if (diff < 365) return `${Math.round(diff / 30)} months away`;
  return `${Math.round(diff / 365)} year${Math.round(diff / 365) > 1 ? "s" : ""} away`;
}

export function EventCard({ event }: EventCardProps) {
  const countdown = getDaysUntil(event.date_start);
  const isPast = countdown === "Past";

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-shadow p-6 flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
          <CalendarDays className="w-5 h-5 text-primary" />
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
            isPast
              ? "border-muted text-muted-foreground bg-muted/40"
              : "border-primary/20 text-primary bg-primary/5"
          }`}
        >
          {countdown}
        </span>
      </div>

      {/* Event name */}
      <div>
        <h3 className="font-serif font-bold text-foreground text-xl leading-snug mb-1">
          {event.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(event.date_start, event.date_end)}
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          /{event.slug}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-1">
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
    </motion.div>
  );
}
