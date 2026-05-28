import { differenceInDays, format } from "date-fns";
import { CalendarClock, CalendarX } from "lucide-react";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useInvitationQuery } from "../../invitation/queries";

const DeadlineAlert = () => {
  const { data: invitation } = useInvitationQuery();

  if (!invitation?.rsvp_deadline) return null;

  const deadline = new Date(invitation.rsvp_deadline.trim().replace(" ", "T"));
  if (isNaN(deadline.getTime())) return null;

  const now = new Date();
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

  const daysLabel = `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;
  let description = `${daysLabel} for guests to submit their RSVP.`;

  if (isPast) description = "Guests can no longer submit RSVPs.";
  else if (isUrgent)
    description = `${daysLabel} — follow up with any pending guests now.`;
  else if (isWarning)
    description = `${daysLabel} — check for any guests who haven't responded.`;

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
