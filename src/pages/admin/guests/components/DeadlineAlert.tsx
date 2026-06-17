import type { FC } from "react";
import { motion, type Variants } from "framer-motion";
import { differenceInDays, differenceInSeconds, format } from "date-fns";
import { CalendarClock, CalendarX } from "lucide-react";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNow } from "@/hooks/use-now";
import { formatRemainingTime } from "@/lib/utils/utils-time";

// Height + bottom-margin reveal, so the mb-6 gap collapses with the alert on
// exit instead of snapping away once height hits 0. (24 = mb-6 = 1.5rem.)
const deadlineReveal: Variants = {
  initial: { opacity: 0, y: -4, height: 0, marginBottom: 0 },
  animate: {
    opacity: 1,
    y: 0,
    height: "auto",
    marginBottom: 24,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    y: -4,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.15 },
  },
};

interface DeadlineAlertProps {
  /** RSVP deadline of the focused invitation page ("YYYY-MM-DD HH:MM" or null). */
  deadline: string | null;
}

const DeadlineAlert: FC<DeadlineAlertProps> = ({ deadline: deadlineStr }) => {
  const deadline = deadlineStr
    ? new Date(deadlineStr.trim().replace(" ", "T"))
    : null;

  // Only tick every second in the final hour, where the countdown shows
  // seconds; above that the label changes by the minute at most, so a 1s
  // re-render is wasted work.
  const isParseable = !!deadline && !isNaN(deadline.getTime());
  const underAnHour =
    isParseable && differenceInSeconds(deadline!, new Date()) < 3_600;
  const now = useNow(underAnHour ? 1_000 : 60_000);

  if (!deadlineStr || !deadline || !isParseable) return null;
  const secondsLeft = differenceInSeconds(deadline, now);
  const daysLeft = differenceInDays(deadline, now);
  const isPast = deadline < now;
  const isUrgent = daysLeft < 3;
  const isWarning = daysLeft < 7;

  const formatted = format(deadline, "do MMMM yyyy, 'at' h:mm a");

  const variant =
    isPast || isUrgent ? "destructive" : isWarning ? "warning" : "default";
  const Icon = isPast ? CalendarX : CalendarClock;

  const title = isPast
    ? `RSVP closed · ${formatted}`
    : `RSVP closes on ${formatted}`;

  const timeLabel =
    daysLeft < 1
      ? `${formatRemainingTime(secondsLeft, 1)} left`
      : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;
  let description = `${timeLabel} for guests to submit their RSVP.`;

  if (isPast) description = "Guests can no longer submit RSVPs.";
  else if (isUrgent)
    description = `${timeLabel} — follow up with any pending guests now.`;
  else if (isWarning)
    description = `${timeLabel} — check for any guests who haven't responded.`;

  return (
    <motion.div
      variants={deadlineReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="overflow-hidden"
    >
      <Alert variant={variant} className="sm:flex sm:flex-row">
        <Icon />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="sm:ml-auto sm:text-right">
          {description}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default DeadlineAlert;
