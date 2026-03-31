import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { fadeUp } from "@/pages/planner/animations";
import type { RSVP } from "./types";

interface Props {
  rsvps: RSVP[];
}

export function RSVPStats({ rsvps }: Props) {
  const total = rsvps.reduce(
    (acc, r) => acc + (r.status === "Confirmed" ? r.guests + 1 : 0),
    0,
  );
  const confirmed = rsvps.filter((r) => r.status === "Confirmed").length;
  const pending = rsvps.filter((r) => r.status === "Pending").length;
  const declined = rsvps.filter((r) => r.status === "Declined").length;

  const stats = [
    {
      label: "Total Guests",
      value: total,
      className: "bg-primary/10 border-primary/20 text-primary",
    },
    {
      label: "Confirmed",
      value: confirmed,
      className: "bg-secondary/20 border-border text-secondary-foreground",
    },
    {
      label: "Pending",
      value: pending,
      className: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      label: "Declined",
      value: declined,
      className: "bg-destructive/10 border-destructive/20 text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(({ label, value, className }, i) => (
        <motion.div
          key={label}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp(i * 0.1)}
        >
          <Card className={`border ${className}`}>
            <CardContent className="p-4 text-center">
              <p className="text-xs uppercase font-bold mb-1">{label}</p>
              <p className="text-2xl font-serif font-bold">{value}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
