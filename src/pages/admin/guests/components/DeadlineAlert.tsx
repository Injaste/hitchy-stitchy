import { differenceInDays, differenceInSeconds, format } from "date-fns";
import { CalendarClock, CalendarX } from "lucide-react";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNow } from "@/hooks/use-now";
import { formatRemainingTime } from "@/lib/utils/utils-time";
import { useInvitationQuery } from "../../invitation/queries";

const DeadlineAlert = () => {
  const { data: invitation } = useInvitationQuery();
  const now = useNow(1_000);

  if (!invitation?.rsvp_deadline) return null;

  const deadline = new Date(invitation.rsvp_deadline.trim().replace(" ", "T"));
  if (isNaN(deadline.getTime())) return null;
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
    <Alert variant={variant} className="mb-6 sm:flex sm:flex-row">
      <Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="sm:ml-auto sm:text-right">
        {description}
      </AlertDescription>
    </Alert>
  );
};

export default DeadlineAlert;
